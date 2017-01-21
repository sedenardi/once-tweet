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
  id integer primary key,
  Url text unique,
  Title text,
  PubDate datetime
);
