const HomepageCard = require('../models/HomepageCard');

const mapCardsBySection = (cards) => {
  const sections = {
    'explore-popular-categories': [],
    'salon-for-women': [],
    'cleaning-essentials': [],
    'grooming-for-men': [],
  };

  cards.forEach((card) => {
    if (sections[card.section]) {
      sections[card.section].push(card);
    }
  });

  return sections;
};

const getHomepageCardsPublic = async (req, res) => {
  try {
    const cards = await HomepageCard.find({ isActive: true }).sort({ section: 1, order: 1, createdAt: 1 });
    res.status(200).json({ success: true, sections: mapCardsBySection(cards) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch homepage cards', error: error.message });
  }
};

const getHomepageCardsAdmin = async (req, res) => {
  try {
    const cards = await HomepageCard.find().sort({ section: 1, order: 1, createdAt: 1 });
    res.status(200).json({ success: true, cards });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch homepage cards', error: error.message });
  }
};

const createHomepageCard = async (req, res) => {
  try {
    const { section, title, subtitle, image, time, order, isActive } = req.body;
    if (!section || !title) {
      return res.status(400).json({ success: false, message: 'Section and title are required' });
    }

    const card = await HomepageCard.create({
      section,
      title,
      subtitle: subtitle || '',
      image: image || '',
      time: time || '',
      order: Number(order) || 0,
      isActive: isActive === undefined ? true : String(isActive) !== 'false',
    });

    res.status(201).json({ success: true, message: 'Homepage card created', card });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create homepage card', error: error.message });
  }
};

const updateHomepageCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { section, title, subtitle, image, time, order, isActive } = req.body;

    const updated = await HomepageCard.findByIdAndUpdate(
      id,
      {
        section,
        title,
        subtitle: subtitle || '',
        image: image || '',
        time: time || '',
        order: Number(order) || 0,
        isActive: isActive === undefined ? true : String(isActive) !== 'false',
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Homepage card not found' });
    }

    res.status(200).json({ success: true, message: 'Homepage card updated', card: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update homepage card', error: error.message });
  }
};

const deleteHomepageCard = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await HomepageCard.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Homepage card not found' });
    }
    res.status(200).json({ success: true, message: 'Homepage card deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete homepage card', error: error.message });
  }
};

module.exports = {
  getHomepageCardsPublic,
  getHomepageCardsAdmin,
  createHomepageCard,
  updateHomepageCard,
  deleteHomepageCard,
};
