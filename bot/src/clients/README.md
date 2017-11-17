# getTorrentsList

```
returns Array<TaskInstance>

[{
    hash: _.hash,   // 字符串
    size: _.size,   // bytes
    upspeed: _.rateUpload,   //bytes/s
    upall: _.uploadedEver,
    dlspeed: _.rateDownload,   //bytes/s
    added_on: _.addedDate,
    category: _.category  // 字符串
}]
```

# addTorrent(url)

# deleteTorrents(Array<TaskInstance>)
```
returns Object

{
    error?: bool|any
}
```