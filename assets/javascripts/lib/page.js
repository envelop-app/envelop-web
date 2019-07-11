function confirmClose(e) {
  e.preventDefault();

  const text = 'Task in progress. Are you sure you want to leave?'
  e.returnValue = text;

  return text;
}

async function preventClose(callback) {
  if (!callback || typeof callback !== 'function') {
    throw "callback must be a function"
  }

  try {
    window.addEventListener('beforeunload', confirmClose);
    await callback();
  }
  finally {
    window.removeEventListener('beforeunload', confirmClose);
  }
}

const Page = {};
Page.preventClose = preventClose;

export default Page;
