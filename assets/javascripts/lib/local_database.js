import localforage from 'localforage';

localforage.config({
  driver      : localforage.IndexDB,
  name        : 'envelop',
  version     : 2
});

export default localforage;
