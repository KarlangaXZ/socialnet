const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const Report = require("../models/Report");

// Reportar post, comentario o usuario
router.post("/report/:type/:id", auth, async (req, res) => {
  const { type, id } = req.params;
  const { reason } = req.body;

  if (!["post", "comment", "user"].includes(type)) {
    return res.status(400).json({ msg: "Tipo inválido de reporte" });
  }

  const report = new Report({
    type,
    reportedId: id,
    reason,
    reporter: req.user.id,
  });

  await report.save();
  res.status(201).json({ msg: "Contenido reportado" });
});

// Ver todos los reportes (admin)
router.get("/admin/reports", auth, isAdmin, async (req, res) => {
  const reports = await Report.find().populate("reporter", "username");
  res.json(reports);
});

// Resolver reporte (admin)
router.post("/admin/reports/:id/action", auth, isAdmin, async (req, res) => {
  const { action } = req.body;
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ msg: "Reporte no encontrado" });

  if (!["resolved", "ignored"].includes(action)) {
    return res.status(400).json({ msg: "Acción inválida" });
  }

  report.status = action;
  await report.save();

  //  eliminar contenido
  if (report.type === "post" && action === "resolved") {
    await Post.findByIdAndDelete(report.reportedId);
  }
  if (report.type === "comment" && action === "resolved") {
    await Comment.findByIdAndDelete(report.reportedId);
  }
  if (report.type === "user" && action === "resolved") {
    await User.findByIdAndDelete(report.reportedId);
  }

  res.json({ msg: `Reporte ${action}` });
});

module.exports = router;
