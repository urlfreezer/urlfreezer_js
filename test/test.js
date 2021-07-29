import assert from "assert";
import { URLFreezer } from "../src/index.js";
import { JSDOM } from "jsdom";
import fs from "fs";

function loadPage(actAs) {
  const page = fs.readFileSync("./test/fixtures/page.html", "utf-8");
  const { document } = new JSDOM(page).window;
  global.document = document;
  global.window = { location: { hostname: actAs } };
}

describe("urlfreezer", function () {
  describe("findLinks", function () {
    it("should find 3 links", function () {
      loadPage("other");
      let uf = new URLFreezer("do not matter");
      let links = uf.findLinks();
      assert(
        links.usages.filter((u) => u.link == "http://www.urlfrezer.com/")
          .length == 2
      );
      assert(
        links.usages.filter(
          (u) => u.link == "http://www.urlfrezer.com/about.com"
        ).length == 1
      );
    });

    it("should ignore self links", function () {
      loadPage("http://www.urlfrezer.com/");
      let uf = new URLFreezer("do not matter");
      let links = uf.findLinks();
      assert(links.usages.length == 1);
    });
  });
  describe("replace links", function () {
    it("should should replace links v1", function () {
      loadPage("other");
      let uf = new URLFreezer("do not matter");
      let found = uf.findLinks();
      found.replaceV1({
        base: "http://test.com/",
        links: [
          {
            url: "http://www.urlfrezer.com/",
            action: "Content",
            link_id: "AABBCC",
          },
        ],
      });
      let links = uf.findLinks();
      assert(
        links.usages.filter((u) => u.link == "http://test.com/AABBCC").length ==
          2
      );
    });

    it("should should replace links v2", function () {
      loadPage("other");
      let uf = new URLFreezer("do not matter");
      let found = uf.findLinks();
      found.replaceV2({
        base: "http://test.com/",
        links: [
          {
            link: "http://www.urlfrezer.com/",
            link_label: " label",
            action: "Content",
            link_id: "AABBCC",
          },
          {
            link: "http://www.urlfrezer.com/",
            action: "Content",
            link_id: "CCBBAA",
          },
        ],
      });
      let links = uf.findLinks();
      assert(
        links.usages.filter((u) => u.link == "http://test.com/AABBCC").length ==
          1
      );
      assert(
        links.usages.filter((u) => u.link == "http://test.com/CCBBAA").length ==
          1
      );
    });
  });
  describe("request infos", function () {
    it("links request v2", function () {
      loadPage("other");
      let uf = new URLFreezer("do not matter");
      let found = uf.findLinks();
      let requestLinks = found.getUsagesReqV2();
      assert(requestLinks.filter((u) => u.link_label == " label").length == 1);
      assert(
        requestLinks.filter((u) => u.link == "http://www.urlfrezer.com/")
          .length == 2
      );
    });
    it("links request v1", function () {
      loadPage("other");
      let uf = new URLFreezer("do not matter");
      let found = uf.findLinks();
      let requestLinks = found.getUsagesReqV1();
      assert(
        requestLinks.filter((u) => u == "http://www.urlfrezer.com/").length == 2
      );
    });
  });
});
