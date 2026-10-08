import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "./db.js";

dotenv.config();

const app = express();
const PORT = 3000;
const SECRET = process.env.JWT_SECRET || "hr_secret";

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());


// =========================
// AUTH
// =========================
function auth(req, res, next) {

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "กรุณาเข้าสู่ระบบ"
    });
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({
      message: "Token ไม่ถูกต้อง"
    });
  }
}


// =========================
// HOME
// =========================
app.get("/", (req, res) => {
  res.json({
    message: "HRsystem API"
  });
});


// =========================
// LOGIN
// =========================
app.post("/login", async (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "กรุณากรอก Username และ Password"
    });
  }

  try {

    const [rows] = await db.promise().query(
      `SELECT * FROM users WHERE username = ?`,
      [username]
    );

    if (!rows.length) {
      return res.status(401).json({
        message: "Username หรือ Password ไม่ถูกต้อง"
      });
    }

    const user = rows[0];

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(401).json({
        message: "Username หรือ Password ไม่ถูกต้อง"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fname: user.fname,
        lname: user.lname,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {

    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "เข้าสู่ระบบไม่สำเร็จ"
    });

  }
});


// =========================
// SIGNUP
// =========================
app.post("/signup", async (req, res) => {

  const {
    fname,
    lname,
    username,
    password,
    role,
    department
  } = req.body;

  if (!fname || !lname || !username || !password || !role) {
    return res.status(400).json({
      message: "กรุณากรอกข้อมูลให้ครบ"
    });
  }

  if (
    role === "evaluatee" &&
    !department
  ) {
    return res.status(400).json({
      message: "กรุณาระบุแผนก"
    });
  }

  if (
    !["personnel", "evaluator", "evaluatee"].includes(role)
  ) {
    return res.status(400).json({
      message: "Role ไม่ถูกต้อง"
    });
  }

  try {

    // ตรวจ Username
    const [oldUser] = await db.promise().query(
      `SELECT id FROM users WHERE username = ?`,
      [username]
    );

    if (oldUser.length) {
      return res.status(400).json({
        message: "Username นี้มีผู้ใช้งานแล้ว"
      });
    }

    // เข้ารหัส Password
    const passwordHash = await bcrypt.hash(password, 10);

    // เพิ่ม User
    const [result] = await db.promise().query(
      `INSERT INTO users
      (fname, lname, username, password, role, department)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        fname,
        lname,
        username,
        passwordHash,
        role,
        department || ""
      ]
    );

    // สร้าง Assignment สำหรับผู้รับการประเมิน
    if (role === "evaluatee") {

      const [settings] = await db.promise().query(
        `SELECT id, period_name
         FROM settings
         ORDER BY id
         LIMIT 1`
      );

      const [evaluators] = await db.promise().query(
        `SELECT id
         FROM users
         WHERE role = 'evaluator'
         ORDER BY id
         LIMIT 1`
      );

      if (settings.length && evaluators.length) {

        await db.promise().query(
          `INSERT INTO assignments
          (
            evaluator_id,
            evaluatee_id,
            evaluatee_name,
            department,
            period_id,
            period,
            status,
            evaluatee_data
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            evaluators[0].id,
            result.insertId,
            `${fname} ${lname}`,
            department,
            settings[0].id,
            settings[0].period_name,
            "รอประเมิน",
            "{}"
          ]
        );
      }
    }

    res.json({
      success: true,
      message: "สมัครสมาชิกเรียบร้อยแล้ว"
    });

  } catch (error) {

    console.error("SIGNUP ERROR:", error);

    res.status(500).json({
      message: "สมัครสมาชิกไม่สำเร็จ"
    });

  }
});


// =========================
// EVALUATEE
// =========================
app.get("/api/evaluatee", auth, async (req, res) => {

  try {

    // หา Assignment
    let [assignments] = await db.promise().query(
      `SELECT *
       FROM assignments
       WHERE evaluatee_id = ?
       LIMIT 1`,
      [req.user.id]
    );

    // ถ้ายังไม่มี Assignment
    if (!assignments.length) {

      const [user] = await db.promise().query(
        `SELECT fname, lname, department
         FROM users
         WHERE id = ?`,
        [req.user.id]
      );

      const [settings] = await db.promise().query(
        `SELECT id, period_name
         FROM settings
         ORDER BY id
         LIMIT 1`
      );

      const [evaluators] = await db.promise().query(
        `SELECT id
         FROM users
         WHERE role = 'evaluator'
         ORDER BY id
         LIMIT 1`
      );

      if (
        !user.length ||
        !settings.length ||
        !evaluators.length
      ) {
        return res.json({
          assignment: null,
          indicators: []
        });
      }

      await db.promise().query(
        `INSERT INTO assignments
        (
          evaluator_id,
          evaluatee_id,
          evaluatee_name,
          department,
          period_id,
          period,
          status,
          evaluatee_data
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          evaluators[0].id,
          req.user.id,
          `${user[0].fname} ${user[0].lname}`,
          user[0].department || "",
          settings[0].id,
          settings[0].period_name,
          "รอประเมิน",
          "{}"
        ]
      );

      [assignments] = await db.promise().query(
        `SELECT *
         FROM assignments
         WHERE evaluatee_id = ?
         LIMIT 1`,
        [req.user.id]
      );
    }

    const assignment = assignments[0];

    // ตัวชี้วัด
    const [settings] = await db.promise().query(
      `SELECT *
       FROM settings
       WHERE period_name = ?
       ORDER BY id`,
      [assignment.period]
    );

    // ข้อมูลที่เคยบันทึก
    let data = assignment.evaluatee_data || {};

    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        data = {};
      }
    }

    // รวมข้อมูล
    const indicators = settings.map(item => ({
      ...item,
      ...(data[item.id] || {})
    }));

    res.json({
      assignment,
      indicators
    });

  } catch (error) {

    console.error("EVALUATEE ERROR:", error);

    res.status(500).json({
      message: "โหลดข้อมูลไม่สำเร็จ"
    });

  }
});


// =========================
// SAVE EVALUATEE
// บันทึกทุกตัวชี้วัดครั้งเดียว
// =========================
app.post("/api/evaluatee", auth, async (req, res) => {

  try {

    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        message: "ไม่พบข้อมูล"
      });
    }

    const [result] = await db.promise().query(
      `UPDATE assignments
       SET evaluatee_data = ?
       WHERE evaluatee_id = ?`,
      [
        JSON.stringify(data),
        req.user.id
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        message: "ไม่พบ Assignment"
      });
    }

    res.json({
      success: true,
      message: "บันทึกข้อมูลเรียบร้อย"
    });

  } catch (error) {

    console.error("SAVE ERROR:", error);

    res.status(500).json({
      message: "บันทึกข้อมูลไม่สำเร็จ"
    });

  }
});

app.get("/api/evaluatee/assignments", auth, async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        a.id,
        a.evaluatee_name,
        a.department,
        a.period,
        a.status,
        u.fname AS evaluator_fname,
        u.lname AS evaluator_lname
      FROM assignments a
      LEFT JOIN users u
        ON a.evaluator_id = u.id
      ORDER BY a.id DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "โหลดข้อมูลไม่สำเร็จ"
    });
  }
});
// =========================
// SETTINGS GET
// =========================
app.get("/api/evaluation-settings", auth, async (req, res) => {

  try {

    const [rows] = await db.promise().query(
      `SELECT *
       FROM settings
       ORDER BY id DESC`
    );

    res.json(rows);

  } catch (error) {

    console.error("SETTINGS ERROR:", error);

    res.status(500).json({
      message: "โหลดข้อมูลไม่สำเร็จ"
    });

  }
});
app.get("/api/evaluator/assignments/:id", auth, async (req, res) => {
  try {

    // ข้อมูลผู้รับการประเมิน
    const [rows] = await db.promise().query(`
      SELECT
        a.id,
        a.evaluatee_id,
        a.evaluatee_name,
        a.department,
        a.period,
        a.status
      FROM assignments a
      WHERE a.id = ?
        AND a.evaluator_id = ?
    `, [req.params.id, req.user.id]);

    if (!rows.length) {
      return res.status(404).json({
        message: "ไม่พบผู้รับการประเมิน"
      });
    }

    const assignment = rows[0];


    // ตัวชี้วัด
    const [settings] = await db.promise().query(`
      SELECT
        id,
        period_name,
        topic_name,
        indicator_name,
        weight,
        evidence_type
      FROM settings
      WHERE period_name = ?
      ORDER BY id
    `, [assignment.period]);


    // ข้อมูลที่ผู้รับการประเมินกรอก
    let evaluateeData = {};

    if (assignment.evaluatee_data) {
      evaluateeData = assignment.evaluatee_data;

      if (typeof evaluateeData === "string") {
        evaluateeData = JSON.parse(evaluateeData);
      }
    }


    const indicators = settings.map(item => ({
      id: item.id,
      topic_name: item.topic_name,
      indicator_name: item.indicator_name,
      weight: item.weight,
      evidence_type: item.evidence_type,

      detail: evaluateeData[item.id]?.detail || "",
      evidence: evaluateeData[item.id]?.evidence || "",
      self_score: evaluateeData[item.id]?.self_score || ""
    }));


    res.json({
      success: true,
      assignment,
      indicators
    });

  } catch (error) {

    console.error("EVALUATOR ERROR:", error);

    res.status(500).json({
      message: "โหลดข้อมูลไม่สำเร็จ",
      error: error.message
    });

  }
});
app.post("/api/evaluator/assignments/:id", auth, async (req, res) => {
  try {

    const { scores } = req.body;

    console.log("ID =", req.params.id);
    console.log("SCORES =", scores);

    const [rows] = await db.promise().query(`
      SELECT id
      FROM assignments
      WHERE id = ?
      AND evaluator_id = ?
    `, [
      req.params.id,
      req.user.id
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "ไม่พบข้อมูลการประเมิน"
      });
    }

    await db.promise().query(`
      UPDATE assignments
      SET
        evaluator_data = ?,
        status = 'ประเมินแล้ว'
      WHERE id = ?
    `, [
      JSON.stringify(scores),
      req.params.id
    ]);

    res.json({
      success: true,
      message: "บันทึกผลการประเมินเรียบร้อย"
    });

  } catch (error) {

    console.error("SAVE ERROR =", error);

    res.status(500).json({
      success: false,
      message: "บันทึกไม่สำเร็จ",
      error: error.message
    });

  }
});
// =========================
// SETTINGS ADD
// =========================
app.post("/api/evaluation-settings", auth, async (req, res) => {

  try {

    const {
      period_name,
      topic_name,
      indicator_name,
      weight,
      evidence_type
    } = req.body;

    await db.promise().query(
      `INSERT INTO settings
      (
        period_name,
        topic_name,
        indicator_name,
        weight,
        evidence_type
      )
      VALUES (?, ?, ?, ?, ?)`,
      [
        period_name,
        topic_name,
        indicator_name,
        weight || 0,
        evidence_type || "none"
      ]
    );

    res.json({
      success: true,
      message: "เพิ่มข้อมูลสำเร็จ"
    });

  } catch (error) {

    console.error("SETTINGS ADD ERROR:", error);

    res.status(500).json({
      message: "เพิ่มข้อมูลไม่สำเร็จ"
    });

  }
});


// =========================
// SETTINGS EDIT
// =========================
app.put("/api/evaluation-settings/:id", auth, async (req, res) => {

  try {

    const {
      period_name,
      topic_name,
      indicator_name,
      weight,
      evidence_type
    } = req.body;

    await db.promise().query(
      `UPDATE settings
       SET period_name = ?,
           topic_name = ?,
           indicator_name = ?,
           weight = ?,
           evidence_type = ?
       WHERE id = ?`,
      [
        period_name,
        topic_name,
        indicator_name,
        weight || 0,
        evidence_type || "none",
        req.params.id
      ]
    );

    res.json({
      success: true,
      message: "แก้ไขข้อมูลสำเร็จ"
    });

  } catch (error) {

    console.error("SETTINGS EDIT ERROR:", error);

    res.status(500).json({
      message: "แก้ไขข้อมูลไม่สำเร็จ"
    });

  }
});


// =========================
// SETTINGS DELETE
// =========================
app.delete("/api/evaluation-settings/:id", auth, async (req, res) => {

  try {

    await db.promise().query(
      `DELETE FROM settings
       WHERE id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "ลบข้อมูลสำเร็จ"
    });

  } catch (error) {

    console.error("SETTINGS DELETE ERROR:", error);

    res.status(500).json({
      message: "ลบข้อมูลไม่สำเร็จ"
    });

  }
});

app.get("/api/reports", auth, async (req, res) => {
  try {

    const [rows] = await db.promise().query(`
      SELECT
        a.id,
        a.evaluatee_name,
        a.department,
        a.period,
        a.status,
        u.fname AS evaluator_fname,
        u.lname AS evaluator_lname
      FROM assignments a
      LEFT JOIN users u
        ON a.evaluator_id = u.id
      WHERE a.status = 'ประเมินแล้ว'
      ORDER BY a.id DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {

    console.error("REPORT ERROR =", error);

    res.status(500).json({
      message: "โหลดรายงานไม่สำเร็จ"
    });

  }
});
app.get("/api/profile", auth, async (req, res) => {
  const [rows] = await db.promise().query(
    "SELECT fname,lname,username FROM users WHERE id=?",
    [req.user.id]
  );
  res.json(rows[0]);
});

app.put("/api/profile", auth, async (req, res) => {
  const { fname, lname, username } = req.body;

  await db.promise().query(
    "UPDATE users SET fname=?,lname=?,username=? WHERE id=?",
    [fname, lname, username, req.user.id]
  );

  res.json({ message: "บันทึกเรียบร้อย" });
});
// =========================
// START SERVER
// =========================
app.listen(PORT, () => {
  console.log(`Server: http://localhost:${PORT}`);
});