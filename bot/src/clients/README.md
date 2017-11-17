# Interfaces
## getTorrentsList

```
returns Array<TaskInstance>

[{
    hash: _.hash,   // 字符串
    size: _.size,   // bytes
    upspeed: _.rateUpload,   // bytes/s
    upall: _.uploadedEver,   // bytes
    dlspeed: _.rateDownload,   // bytes/s
    added_on: _.addedDate,   // timestamp/1000 (seconds since Unix epoch)
    category: _.category  // 字符串
}]
```

## addTorrent(url)

## deleteTorrents(Array<TaskInstance>)
```
returns Object

{
    error?: bool|any
}
```


# Samples
## qBittorrent
```
{ added_on: 1510618301,
  category: '',
  completed: 4212329022,
  completion_on: 1510644146,
  dl_limit: 0,
  dlspeed: 0,
  downloaded: 4213394347,
  downloaded_session: 4213394347,
  eta: 8640000,
  f_l_piece_prio: false,
  force_start: false,
  hash: '79b85aea079692ec77cd994b11861d54aaa386ea',
  last_activity: 1510844223,
  name: '...',
  num_complete: 21,
  num_incomplete: 1,
  num_leechs: 0,
  num_seeds: 0,
  priority: 0,
  progress: 1,
  ratio: 6.290788346899541,
  ratio_limit: -1,
  remaining: 0,
  save_path: '/root/Downloads/',
  seen_complete: 1510846423,
  seq_dl: false,
  size: 4212329022,
  state: 'stalledUP',
  super_seeding: false,
  total_size: 4212329022,
  tracker: '...',
  up_limit: 0,
  uploaded: 26505572059,
  uploaded_session: 26505572059,
  upspeed: 0,
  upall: 26498870324.904343 }
```

## transmission
```
{ id: 222,
  hash: '1ba196ed84de5e2e80b19de013fb115597ea4629',
  size: 3840156496,
  upspeed: 0,
  upall: 4888015,
  dlspeed: 26000,
  added_on: 1510886412,
  category: '' }
```

## rutorrent
```
{ age: 0,
    hash: '88154720F93E00177523427ED4A415FECCE0DCBB',
    name: '...',
    upspeed: 0,
    dlspeed: 0,
    ratio: 0,
    size: 2016165888,
    done_size: 0,
    seedTime: 0,
    added_on: 1510885503,
    category: '',
    upall: 0 }
```