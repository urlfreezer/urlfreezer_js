function getPageLinks() {
  let elements = document.getElementsByTagName("a");
  let result = [];
  let host = window.location.hostname;
  for (let cur in elements) {
    let element = elements[cur];
    if (element.getAttribute) {
      let url = element.getAttribute("href");
      if (url.startsWith("http") && !url.includes(host)) {
        result.push({ link: url, link_label: element.innerText });
      }
    }
  }
  return result;
}

function replaceLinks(links) {
  let elements = document.getElementsByTagName("a");
  let result = [];
  for (let cur in elements) {
    let element = elements[cur];
    if (element.getAttribute) {
      let link = links.get(element.getAttribute("href"));
      if (link) {
        element.setAttribute("href", link);
      }
    }
  }
}

function fetchLinks(base, user) {
  let links = getPageLinks();
  let page = window.document.href;
  fetch(base + "api/fetch_links_v2", {
    method: "POST",
    body: JSON.stringify({
      user: user,
      page: page,
      links: links,
    }),
    headers: { "content-type": "application/json" },
  }).then(function (response) {
    if (response.ok) {
      let data = response.json();
      let newLinks = new Map();
      for (let cur in data.links) {
        let link = data.links[cur];
        if (link.action.toLowerCase() == "content") {
          newLinks.set(link.url, base + link.link_id);
        }
      }
      replaceLinks(newLinks);
    }
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
    fetchLinks(this.url, this.user);
  }
}
