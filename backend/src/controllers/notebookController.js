const Notebook = require('../models/Notebook');
const logger = require('../config/logger');

const getNotebooks = async (req, res, next) => {
  try {
    const notebooks = await Notebook.find({ userId: req.user._id })
      .select('name createdAt lastModified pages')
      .sort({ lastModified: -1 });
    
    res.json(notebooks);
  } catch (error) {
    next(error);
  }
};

const getNotebook = async (req, res, next) => {
  try {
    const notebook = await Notebook.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    res.json(notebook);
  } catch (error) {
    next(error);
  }
};

const createNotebook = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    const notebook = await Notebook.create({
      name,
      userId: req.user._id,
      pages: [{ drawings: [], text: '', pageNumber: 1 }]
    });
    
    logger.info(`Notebook created: ${name} by user ${req.user._id}`);
    
    res.status(201).json(notebook);
  } catch (error) {
    next(error);
  }
};

const updateNotebook = async (req, res, next) => {
  try {
    const { pages, name } = req.body;
    
    const notebook = await Notebook.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        ...(pages && { pages }),
        ...(name && { name }),
        lastModified: new Date()
      },
      { new: true, runValidators: true }
    );
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    res.json(notebook);
  } catch (error) {
    next(error);
  }
};

const deleteNotebook = async (req, res, next) => {
  try {
    const notebook = await Notebook.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!notebook) {
      return res.status(404).json({ error: 'Notebook not found' });
    }
    
    logger.info(`Notebook deleted: ${notebook.name} by user ${req.user._id}`);
    
    res.json({ message: 'Notebook deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotebooks,
  getNotebook,
  createNotebook,
  updateNotebook,
  deleteNotebook
};