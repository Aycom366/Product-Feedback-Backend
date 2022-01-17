const path = require("path");

const uploadImage = async (req, res, next) => {
  if (req.files) {
    const pic = req.files.pic;

    try {
      //create a path to pass in the mv function (express file upload)
      const imagePath = path.join(
        __dirname,
        "../public/uploads/" + `${pic.name}`
      );
      await pic.mv(imagePath);
      req.pic = `/uploads/${pic.name}`;
      return next();
    } catch (error) {
      res.status(500);
      throw new Error(error);
    }
  }
  next();
};

module.exports = uploadImage;
