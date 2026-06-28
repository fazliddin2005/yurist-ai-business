// b2b/routes/dashboard.js
// Workspace egasi/menejerlari uchun yuridik holatni umumlashtiruvchi
// statistik ko'rsatkichlar. Faqat o'qish (kamida 'viewer' roli kifoya).
const express = require('express');
const { Template, Audit } = require('../../models');
const { requireAuth } = require('../../routes/auth');
const ws = require('../workspace');

const router = express.Router();
router.use(requireAuth);
router.use('/:workspaceId', ws.requireWorkspaceAccess('viewer'));

// GET /api/b2b/dashboard/:workspaceId -- asosiy ko'rsatkichlar
router.get('/:workspaceId', async (req, res) => {
  try {
    const wid = req.workspace.id;
    const [templates, audits, members] = await Promise.all([
      Template.find({ organizationId: wid }),
      Audit.find({ organizationId: wid }),
      ws.listMembers(wid),
    ]);

    const auditsByTier = { good: 0, med: 0, bad: 0, unknown: 0 };
    let totalHighRisk = 0, totalMedRisk = 0, totalLowRisk = 0;
    audits.forEach((a) => {
      const tier = a.tier || 'unknown';
      auditsByTier[tier] = (auditsByTier[tier] || 0) + 1;
      (a.findings || []).forEach((f) => {
        if (f.sev === 'high') totalHighRisk++;
        else if (f.sev === 'med') totalMedRisk++;
        else totalLowRisk++;
      });
    });

    const avgScore = audits.length
      ? Math.round(audits.reduce((sum, a) => sum + (a.score || 0), 0) / audits.length)
      : null;

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentAudits = audits.filter((a) => new Date(a.createdAt).getTime() > thirtyDaysAgo);

    res.json({
      workspace: {
        id: req.workspace.id, name: req.workspace.name, plan: req.workspace.plan,
        // DIQQAT: kredit endi workspace'ga emas, TIZIMGA KIRGAN FOYDALANUVCHIGA
        // tegishli -- B2C bilan bir xil shaxsiy balans (req.user.credits).
        credits: req.user.credits, primaryJurisdictionId: req.workspace.primaryJurisdictionId,
      },
      stats: {
        totalTemplates: templates.filter((t) => t.status === 'active').length,
        totalAudits: audits.length,
        recentAudits: recentAudits.length,
        totalMembers: members.length,
        seatsLimit: req.workspace.seatsLimit,
        avgRiskScore: avgScore,
        auditsByTier,
        risksByLevel: { high: totalHighRisk, med: totalMedRisk, low: totalLowRisk },
      },
      recentActivity: audits
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .slice(-5)
        .reverse()
        .map((a) => ({ id: a.id, fileName: a.fileName, score: a.score, tier: a.tier, createdAt: a.createdAt })),
    });
  } catch (e) {
    console.error('[b2b dashboard] xato:', e);
    res.status(500).json({ error: 'Dashboard ma\'lumotlarini yuklashda xato yuz berdi' });
  }
});

module.exports = router;
