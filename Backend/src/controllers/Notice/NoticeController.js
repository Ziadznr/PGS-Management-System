const NoticeService = require("../../services/notice/NoticeService");

exports.Create = async (req, res) =>
  res.status(200).json(await NoticeService.Create(req));

exports.Update = async (req, res) =>
  res.status(200).json(await NoticeService.Update(req));

exports.Delete = async (req, res) =>
  res.status(200).json(await NoticeService.Delete(req));

exports.TogglePin = async (req, res) =>
  res.status(200).json(await NoticeService.TogglePin(req));

exports.ToggleLock = async (req, res) =>
  res.status(200).json(await NoticeService.ToggleLock(req));

exports.AdminList = async (req, res) =>
  res.status(200).json(await NoticeService.AdminList());

exports.PublicList = async (req, res) =>
  res.status(200).json(await NoticeService.PublicList());

exports.PublicLatest = async (req, res) =>
  res.status(200).json(await NoticeService.PublicLatest());
