class LinkUsage {
  constructor(element) {
    let url = element.getAttribute("href");
    this.link = url;
    this.linkLabel = element.textContent;
    this.element = element;
  }
  getId() {
    return this.link + this.linkLabel;
  }
  replaceLink(link) {
    this.element.setAttribute("href", link);
  }
}

class Usages {
  constructor() {
    this.usages = [];
    this.map = new Map();
  }
  push(usage) {
    this.usages.push(usage);
  }
  replaceV1(mapping) {
    let newLinks = new Map();
    let base = mapping.base;
    for (let link of mapping.links) {
      if (link.action.toLowerCase() == "content") {
        newLinks.set(link.url, base + link.link_id);
      }
    }
    this.apply(newLinks);
  }
  replaceV2(mapping) {
    let newLinks = new Map();
    let base = mapping.base;
    for (let link of mapping.links) {
      if (link.action.toLowerCase() == "content") {
        if (link.link_label) {
          newLinks.set(link.link + link.link_label, base + link.link_id);
        } else {
          newLinks.set(link.link, base + link.link_id);
        }
      }
    }
    this.apply(newLinks);
  }
  apply(newLinks) {
    for (let usage of this.usages) {
      let link = newLinks.get(usage.link + usage.linkLabel);
      if (link) {
        usage.replaceLink(link);
      } else {
        let link = newLinks.get(usage.link);
        if (link) {
          usage.replaceLink(link);
        }
      }
    }
  }

  getUsagesReqV2() {
    let usagesRes = [];
    for (let usage of this.usages) {
      usagesRes.push({ link: usage.link, link_label: usage.linkLabel });
    }
    return usagesRes;
  }

  getUsagesReqV1() {
    let usagesRes = [];
    for (let usage of this.usages) {
      usagesRes.push(usage.link);
    }
    return usagesRes;
  }
}

function findPageLinks() {
  let elements = document.getElementsByTagName("a");
  let result = new Usages();
  let host = window.location.hostname;
  for (let cur in elements) {
    let element = elements[cur];
    if (element.getAttribute) {
      let url = element.getAttribute("href");
      if (url.startsWith("http") && !url.includes(host)) {
        result.push(new LinkUsage(element));
      }
    }
  }
  return result;
}

function replaceLinks(base, user) {
  let usages = findPageLinks();
  let links = usages.getUsagesReqV2();
  let page = window.document.href;
  fetch(base + "api/fetch_links_v2", {
    method: "POST",
    body: JSON.stringify({
      user: user,
      page: page,
      links: links,
    }),
    headers: { "content-type": "application/json" },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      usages.replaceV2(data);
    })
    .catch(function (error_v2) {
      let links = usages.getUsagesReqV1();
      fetch(base + "api/fetch_links", {
        method: "POST",
        body: JSON.stringify({
          user: user,
          page: page,
          links: links,
        }),
        headers: { "content-type": "application/json" },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          usages.replaceV1(data);
        })
        .catch(function (error_v1) {
          console.log("error fetching links v2 " + error_v2);
          console.log("error fetching links v1 " + error_v1);
        });
    });
}

export class URLFreezer {
  constructor(user, url) {
    this.user = user;
    if (url) {
      this.url = url;
    } else {
      this.url = "https://urlfreezer.com/";
    }
  }
  replacePageLinks() {
    replaceLinks(this.url, this.user);
  }
  findLinks() {
    return findPageLinks();
  }
}
