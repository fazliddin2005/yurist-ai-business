// models/index.js -- barcha Mongoose modellarini bitta joydan import qilish uchun
const { connectDB, isConnected } = require('./connection');
const User = require('./User');
const { Organization, Member } = require('./Organization');
const APIKey = require('./APIKey');
const Chat = require('./Chat');
const Case = require('./Case');
const AccuracyScore = require('./AccuracyScore');
const TermsVersion = require('./TermsVersion');
const DeletionRequest = require('./DeletionRequest');
const SecurityIncident = require('./SecurityIncident');
const Document = require('./Document');
const { Template, TemplateVersion } = require('./Template');
const Audit = require('./Audit');
const Invite = require('./Invite');
const ActivityLog = require('./ActivityLog');
const { PromoRedemption, PasswordReset, Verification } = require('./Misc');

module.exports = {
  connectDB, isConnected,
  User, Organization, Member, APIKey, Chat, Case, Document, AccuracyScore, TermsVersion, DeletionRequest, SecurityIncident,
  Template, TemplateVersion, Audit, Invite, ActivityLog,
  PromoRedemption, PasswordReset, Verification,
};
