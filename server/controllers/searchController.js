import { searchQuerySchema } from "../validators/searchValidator.js";
import { globalSearch } from "../services/searchService.js";

export const search = async (req, res) => {
  try {
    const { q } = searchQuerySchema.parse(req.query);

    const results = await globalSearch(q);

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Global Search Error:", error);

    if (error.name === "ZodError") {
      return res.status(400).json({
        success: false,
        message: error.errors[0].message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to perform search.",
    });
  }
};