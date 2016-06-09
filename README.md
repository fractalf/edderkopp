**!! WORK IN PROGRESS !!**

#Config

Config files are written in **json** and organized so that each *level* has a bunch of *nodes*.
```
{
    "id": 1,
    "url": "http://foo.bar/",
    "pages": {
        "pageOne": [ .. ],
        "pageTwo": [ .. ]
    },
    "crawl": {
        "delay": 300,
        "get": [ .. ],
        "skip": [ .. ]
    }

```

Each page contains an array of rule-objects.

```
{
    "name": "myObject",
    "elem": "#container"
    "data": "object",
    "kids": [
        {
            "name": "title",
            "elem": ".title"
        },
        {
            "name": "description",
            "elem": ".desc",
            "data": "html"
        },
        {
            "name": "image",
            "elem": "img",
            "data": [ "attr", "src" ]
        }
    ]
}
```
```
{
    "name": "..",
    "elem": "..",
    "data": "..",
    "task": "..",
    "kids": [ .. ]
}

```
##Types of nodes

###1) Object
When you want to get a bunch of unique properties and collect them in an object
```
{
    "name": "myObject",
    "data": "object",
    "kids": [ .. ]
}
```
Result : `{ myObject: { .. } }`

###2) Array of objects
When you want to get bulks of similar data and collect them in an array (lists, tables, feeds, etc)
```
{
    "name": "myArray",
    "data": "array",
    "kids": [ .. ]
}
```
Result : `{ myArray: [ {..}, {..}, .. ] }`

###3) Container
When you just want to make a container for searching for more elements (collects nothing)
```
{
    "elem": ".foo",
    "kids": [ .. ]
}
```
###4) Content
When you want to get the actual content
```
{
    "name": "myValue",
    "elem": ".value",
    "data": <text|html|attr|data|txtn>
}
```
Details explained further below

##How to get actual content

###Element content, strip tags
```
<div class="text">
  <span>foo</span> bar
</div>
```
```
{
    "name": "myText",
    "elem": ".text",
    "data": "text"
}
```
Result : `{ myText: 'foo bar' }`
Note: This is default

###Element content, include tags

```
<div class="html">
  <span>foo</span> bar
</div>
```
```
{
    "name": "myHtml",
    "elem": ".html",
    "data": "html"
}
```
Result : `{ myHtml: '<span>foo</span> bar' }`

###Element content, only text nodes

```
<div class="text-node">
  <span>foo</span> bar
</div>
```
```
{
    "name": "myTextNode",
    "elem": ".text-node",
    "data": "txtn"
}
```
Result : `{ myTextNode: 'bar' }`

###Element attribute(s)

```
<img class="attr" src="http://foo.bar/img.jpg">
```
```
{
    "name": "myAttr",
    "elem": ".attr",
    "data": [ "attr", "src" ]
}
```
Result : `{ myAttr: 'http://foo.bar/img.jpg' }`

Note: *attr* also supports more arguments, returning an array (see *data* below)

###Element data field(s)

```
<div class="data" data-small="small.jpg" data-big="big.jpg"></div>
```
```
{
    "name": "myData",
    "elem": ".data",
    "data": [ "data", "small", "big" ]
}
```
Result : `{ myData: [ 'small.jpg', 'big.jpg' ] }`

Note: *data* also supports one argument, returning a string (see *attr* above)

###Special case
Sometimes a node has content you want as well as being a container! Take a look at this scenario:
```
<div class="item" meta-title="foobar">
  <a href="http://foo.bar">Click!</a>
  ..
</div>
```
```
{
    "name": "myItem",
    "elem": ".item",
    "data": "object",
    "kids": [
        {
            "name": "title",
            "data": [ "attr", "meta-title" ]
        },
        {
            "name": "url",
            "elem": "a",
            "data": [ "attr", "href" ]
        },
        ..
    ]
}
```
Result : `{ myItem: { title: 'foobar', url: 'http://foo.bar' } }`
Note: The first child has no *elem* defined, so it uses the parent element.

#Parser

###Custom tasks
You can inject your own custom tasks or override those included in the core.
```
// my-tasks.js
export { _myTask as myTask }
..
function _myTask(args, value) {
    return 'foobar';
}
..
```
```
// app.js
import { Parser } from "edderkopp";
import tasks from './my-tasks';

// Inject all tasks defined in my-tasks.js
Parser.injectTasks(tasks);

// Or you can inject an anonymous task
Parser.injectTasks({
    anonTask: function(args, value) {
        return 'foobar';
    }
});
```
Note: If you feel your custom task should be included in core feel free to make a pull request or create an issue.
