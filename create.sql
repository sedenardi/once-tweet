create table Feeds (
  id integer primary key,
  Name text
);

create table FeedUrls (
  id integer primary key,
  FeedId integer,
  Url text
);

create table FeedHandles (
  id integer primary key,
  FeedId integer,
  Name text,
  Key text,
  Secret text
);

create table Items (
  Url text primary key,
  PubDate datetime
);

create table Meta (
  Name text primary key,
  Value text
);
