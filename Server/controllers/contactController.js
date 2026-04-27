const Contact = require('../models/Contact');

const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.',
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject: subject || 'General inquiry',
      message,
    });

    return res.status(201).json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error('Create contact error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to submit contact request',
    });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error('Fetch contacts error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to load contact requests',
    });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found',
      });
    }

    return res.json({
      success: true,
      message: 'Contact request deleted successfully',
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to delete contact request',
    });
  }
};

module.exports = {
  createContact,
  getAllContacts,
  deleteContact,
};
