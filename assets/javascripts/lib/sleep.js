const sleep = (milis) => {
  return new Promise((resolve) => setTimeout(resolve, milis));
};

export default sleep;
