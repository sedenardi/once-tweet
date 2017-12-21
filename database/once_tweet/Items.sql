/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Hash` char(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ScreenName` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_str` varchar(24) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Url` text COLLATE utf8mb4_unicode_ci,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Hash` (`Hash`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
