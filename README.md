# URL Freezer javascript client

Simple library to interact with URL Freezer service from the web browser.


## Example

This example connect to [URLFreezer](https://urlfreezer.com) fetch all the short links
related to the current page defined there.

```javascript
import {URLFreezer} from 'urlfreezer'
let urlFrezer = new URLFreezer('##user_id##'//The user id from URLFreezer)
urlFrezer.replacePageLinks()
```




