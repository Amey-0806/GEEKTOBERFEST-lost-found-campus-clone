const Item = require("../models/Item");
const User = require("../models/User");

const owner = { path: "reportedBy", select: "name email", model: User };

const buildImageUrl = (req) =>
  `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

const createItem = async (req, res) => {
  try {
    const { title, description, type, category, location, date } = req.body;

    if (!title || !description || !type || !category || !location || !date) {
      return res.status(400).json({ message: "All fields required" });
    }

    const item = await Item.create({
      title,
      description,
      type,
      category,
      location,
      date,
      image: req.file ? buildImageUrl(req) : "",
      reportedBy: req.user._id,
    });

    res.status(201).json({ message: "Item reported successfully", item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const VALID_CATEGORIES = [
  "Electronics",
  "Documents",
  "Clothing",
  "Accessories",
  "Books",
  "Keys",
  "Bags",
  "Other",
];

const VALID_LOCATIONS = [
  "Library",
  "Canteen",
  "Hostel",
  "Main Gate",
  "Academic Block",
  "Sports Complex",
  "Parking",
  "Other",
];

const VALID_TYPES = ["lost", "found"];
const VALID_STATUSES = ["active", "claimed", "recovered"];

const getItems = async (req, res) => {
  try {
    const filter = {};

    // 1. Keyword search (title, description, category, location)
    const rawSearch = req.query.search ?? req.query.q ?? req.query.keyword;
    if (typeof rawSearch === "string" && rawSearch.trim() !== "") {
      const escaped = rawSearch.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        { category: { $regex: escaped, $options: "i" } },
        { location: { $regex: escaped, $options: "i" } },
      ];
    }

    // 2. Category filter
    if (req.query.category !== undefined && req.query.category !== "") {
      const catInput = String(req.query.category).trim();
      const matchedCat = VALID_CATEGORIES.find(
        (c) => c.toLowerCase() === catInput.toLowerCase()
      );
      if (!matchedCat) {
        return res.status(400).json({
          message: `Invalid category: '${catInput}'. Allowed categories: ${VALID_CATEGORIES.join(", ")}`,
        });
      }
      filter.category = matchedCat;
    }

    // 3. Location filter
    if (req.query.location !== undefined && req.query.location !== "") {
      const locInput = String(req.query.location).trim();
      const matchedLoc = VALID_LOCATIONS.find(
        (l) => l.toLowerCase() === locInput.toLowerCase()
      );
      if (!matchedLoc) {
        return res.status(400).json({
          message: `Invalid location: '${locInput}'. Allowed locations: ${VALID_LOCATIONS.join(", ")}`,
        });
      }
      filter.location = matchedLoc;
    }

    // 4. Type filter
    if (req.query.type !== undefined && req.query.type !== "") {
      const typeInput = String(req.query.type).trim().toLowerCase();
      if (!VALID_TYPES.includes(typeInput)) {
        return res.status(400).json({
          message: `Invalid type: '${req.query.type}'. Allowed types: ${VALID_TYPES.join(", ")}`,
        });
      }
      filter.type = typeInput;
    }

    // 5. Status filter
    if (req.query.status !== undefined && req.query.status !== "") {
      const statusInput = String(req.query.status).trim().toLowerCase();
      if (!VALID_STATUSES.includes(statusInput)) {
        return res.status(400).json({
          message: `Invalid status: '${req.query.status}'. Allowed statuses: ${VALID_STATUSES.join(", ")}`,
        });
      }
      filter.status = statusInput;
    }

    // 6. Date range filter
    const startDateRaw = req.query.startDate ?? req.query.from ?? req.query.dateFrom;
    const endDateRaw = req.query.endDate ?? req.query.to ?? req.query.dateTo;
    let startDateObj, endDateObj;

    if (startDateRaw !== undefined && startDateRaw !== "") {
      startDateObj = new Date(startDateRaw);
      if (isNaN(startDateObj.getTime())) {
        return res.status(400).json({
          message: `Invalid startDate format: '${startDateRaw}'`,
        });
      }
    }

    if (endDateRaw !== undefined && endDateRaw !== "") {
      endDateObj = new Date(endDateRaw);
      if (isNaN(endDateObj.getTime())) {
        return res.status(400).json({
          message: `Invalid endDate format: '${endDateRaw}'`,
        });
      }
      // If provided as date-only YYYY-MM-DD, cover through end of day
      if (typeof endDateRaw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(endDateRaw.trim())) {
        endDateObj.setUTCHours(23, 59, 59, 999);
      }
    }

    if (startDateObj && endDateObj && startDateObj > endDateObj) {
      return res.status(400).json({
        message: "Invalid date range: startDate cannot be after endDate",
      });
    }

    if (startDateObj || endDateObj) {
      filter.date = {};
      if (startDateObj) filter.date.$gte = startDateObj;
      if (endDateObj) filter.date.$lte = endDateObj;
    }

    // 7. Optional reportedBy filter (supports dashboard queries)
    if (req.query.reportedBy !== undefined && req.query.reportedBy !== "") {
      filter.reportedBy = req.query.reportedBy;
    }

    // 8. Pagination
    let page = 1;
    if (req.query.page !== undefined && req.query.page !== "") {
      page = Number(req.query.page);
      if (!Number.isInteger(page) || page < 1) {
        return res.status(400).json({
          message: `Invalid page: '${req.query.page}'. Page must be a positive integer.`,
        });
      }
    }

    const limitParam = req.query.limit ?? req.query.pageSize;
    let limit = 10;
    if (limitParam !== undefined && limitParam !== "") {
      limit = Number(limitParam);
      if (!Number.isInteger(limit) || limit < 1) {
        return res.status(400).json({
          message: `Invalid limit: '${limitParam}'. Limit must be a positive integer.`,
        });
      }
    }

    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      Item.countDocuments(filter),
      Item.find(filter)
        .populate(owner)
        .sort({ createdAt: -1, date: -1, _id: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      items,
      total,
      totalItems: total,
      page,
      currentPage: page,
      limit,
      pageSize: limit,
      totalPages,
      pagination: {
        total,
        totalItems: total,
        page,
        currentPage: page,
        limit,
        pageSize: limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(owner);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own reports" });
    }

    const allowed = ["title", "description", "type", "category", "location", "date"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.file) {
      updates.image = buildImageUrl(req);
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "Item updated successfully", item: updatedItem });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own reports" });
    }

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "claimed", "recovered"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only update your own reports" });
    }

    item.status = status;
    await item.save();

    res.json({ message: "Status updated", item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getItems, getItem, createItem, updateItem, deleteItem, updateStatus };