// Global data: derives { folder, tag, order, title } for every book from
// the real filesystem layout, so nothing about book names/tags/order is
// hand-maintained in a second place.
//
// - folder: the directory name, e.g. "55-timothy-2"
// - tag: the 11ty collection tag for that book, e.g. "timothy-2"
//        (every <folder>/<folder>.json dir-data file sets "tags" to this
//        same value, derived here by stripping the leading "NN-")
// - title: the human-readable book title, read from the book's index.md
//          frontmatter, e.g. "2 Timothy"
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const BOOKS_DIR = path.join(__dirname, "..", "books");

module.exports = () => {
  return fs
    .readdirSync(BOOKS_DIR)
    .filter((name) => fs.statSync(path.join(BOOKS_DIR, name)).isDirectory())
    .map((folder) => {
      const m = folder.match(/^(\d+)-(.+)$/);
      const tag = m ? m[2] : folder;
      const indexPath = path.join(BOOKS_DIR, folder, "index.md");
      const { data } = matter(fs.readFileSync(indexPath, "utf8"));
      return {
        folder,
        tag,
        order: data.order ?? (m ? parseInt(m[1], 10) : null),
        title: data.title,
      };
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
};
