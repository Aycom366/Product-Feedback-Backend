const Origin = (yes) => {
  let newOrigin = yes.substring(0, yes.length - 1);
  console.log(newOrigin);
  return newOrigin;
};

module.exports = Origin;
