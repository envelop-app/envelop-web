import { ReadableStream, WritableStream } from 'web-streams-polyfill/ponyfill';
import streamSaver from 'streamsaver';
import Constants from './constants'

streamSaver.ReadableStream = ReadableStream;
streamSaver.WritableStream = WritableStream;
streamSaver.mitm = Constants.MITM;

class BrowserDownloader {
  constructor(doc) {
    this.doc = doc;
    this.writeStream = streamSaver.createWriteStream(doc.name, { size: doc.size });
    this.writer = this.writeStream.getWriter();
  }

  collect(raw) {
    const uint8 = new Uint8Array(raw);
    this.writer.write(uint8);
  }

  finish() {
    this.writer.close();
  }
}

export default BrowserDownloader;
