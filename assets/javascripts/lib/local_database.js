import localforage from 'localforage';

localforage.config({
  driver      : localforage.IndexDB,
  name        : 'envelop',
  version     : 0.1
});

export default localforage;
