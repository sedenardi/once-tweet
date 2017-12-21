/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Feeds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Handle` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ScreenNames` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Key` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Secret` text COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
