-- MySQL dump 10.13  Distrib 5.5.38, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: orm
-- ------------------------------------------------------
-- Server version	5.5.38-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `photos`
--

DROP TABLE IF EXISTS `photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `photos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `name` varchar(1000) DEFAULT NULL,
  `url` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photos`
--

LOCK TABLES `photos` WRITE;
/*!40000 ALTER TABLE `photos` DISABLE KEYS */;
INSERT INTO `photos` VALUES (1,'2014-08-27 23:30:32','2014-08-29 16:23:12','Hello','http://google.com/image2.png'),(2,'2014-08-29 12:05:54','2014-08-30 20:14:30','test','http://yandex.com/'),(3,'2014-08-29 12:05:56','2014-08-29 12:05:56','test',NULL),(4,'2014-08-29 12:06:00','2014-08-29 12:06:00','test',NULL),(5,'2014-08-29 12:06:02','2014-08-29 12:06:02','test',NULL),(6,'2014-08-29 12:06:05','2014-08-29 12:06:05','test',NULL),(7,NULL,NULL,'test','url.png'),(8,NULL,NULL,'test','url.png'),(9,NULL,NULL,'test','url.png'),(10,NULL,NULL,'test','url.png'),(11,NULL,NULL,'test','url.png'),(12,NULL,NULL,'test','url.png'),(13,NULL,NULL,'test','url.png'),(14,NULL,NULL,'test','url.png'),(15,NULL,NULL,'test','url.png'),(16,NULL,NULL,'test','url.png'),(17,NULL,NULL,'test','url.png'),(18,NULL,NULL,'test','url.png'),(19,NULL,NULL,'test','url.png'),(20,NULL,NULL,'test','url.png'),(21,NULL,NULL,'test','url.png'),(22,NULL,NULL,'test','url.png'),(23,NULL,NULL,'test','url.png'),(24,NULL,NULL,'test','url.png'),(25,NULL,NULL,'test','url.png'),(26,NULL,NULL,'test','url.png'),(27,NULL,NULL,'test','url.png'),(28,NULL,NULL,'test','url.png'),(29,NULL,NULL,'test','url.png'),(30,NULL,NULL,'test','url.png'),(31,NULL,NULL,'test','url.png'),(32,NULL,NULL,'test','url.png'),(33,NULL,NULL,'test','url.png'),(34,NULL,NULL,'test','url.png'),(35,NULL,NULL,'test','url.png'),(36,NULL,NULL,'test','url.png'),(37,NULL,NULL,'test','url.png'),(38,NULL,NULL,'test','url.png'),(39,NULL,NULL,'test','url.png'),(40,NULL,NULL,'test','url.png'),(41,NULL,NULL,'test','url.png'),(42,NULL,NULL,'test','url.png'),(43,NULL,NULL,'test','url.png'),(44,NULL,NULL,'test','url.png'),(45,NULL,NULL,'test','url.png'),(46,NULL,NULL,'test','url.png'),(47,NULL,NULL,'test','url.png'),(48,NULL,NULL,'test','url.png'),(49,NULL,NULL,'test','url.png'),(50,NULL,NULL,'test','url.png'),(51,NULL,NULL,'test','url.png'),(52,NULL,NULL,'test','url.png'),(53,NULL,NULL,'test','url.png'),(54,NULL,NULL,'test','url.png'),(55,NULL,NULL,'test','url.png'),(56,NULL,NULL,'test','url.png'),(57,NULL,NULL,'test','url.png'),(58,NULL,NULL,'test','url.png'),(59,NULL,NULL,'test','url.png'),(60,NULL,NULL,'test','url.png'),(61,NULL,NULL,'test','url.png'),(62,NULL,NULL,'test','url.png'),(63,NULL,NULL,'test','url.png'),(64,NULL,NULL,'test','url.png'),(65,NULL,NULL,'test','url.png'),(66,NULL,NULL,'test','url.png'),(67,NULL,NULL,'test','url.png'),(68,NULL,NULL,'test','url.png'),(69,NULL,NULL,'test','url.png'),(70,NULL,NULL,'test','url.png'),(71,NULL,NULL,'test','url.png'),(72,NULL,NULL,'test','url.png'),(73,NULL,NULL,'test','url.png'),(74,NULL,NULL,'test','url.png'),(75,NULL,NULL,'test','url.png'),(76,NULL,NULL,'test','url.png'),(77,NULL,NULL,'test','url.png'),(78,NULL,NULL,'test','url.png'),(79,NULL,NULL,'test','url.png'),(80,NULL,NULL,'test','url.png'),(81,NULL,NULL,'test','url.png'),(82,NULL,NULL,'test','url.png'),(83,NULL,NULL,'test','url.png'),(84,NULL,NULL,'test','url.png'),(85,NULL,NULL,'test','url.png'),(86,NULL,NULL,'test','url.png'),(87,NULL,NULL,'test','url.png'),(88,NULL,NULL,'test','url.png'),(89,NULL,NULL,'test','url.png'),(90,NULL,NULL,'test','url.png'),(91,NULL,NULL,'test','url.png'),(92,NULL,NULL,'test','url.png'),(93,NULL,NULL,'test','url.png'),(94,NULL,NULL,'test','url.png'),(95,NULL,NULL,'test','url.png'),(96,NULL,NULL,'test','url.png'),(97,NULL,NULL,'test','url.png'),(98,NULL,NULL,'test','url.png'),(99,NULL,NULL,'test','url.png'),(100,NULL,NULL,'test','url.png'),(101,NULL,NULL,'test','url.png'),(102,NULL,NULL,'test','url.png'),(103,NULL,NULL,'test','url.png'),(104,NULL,NULL,'test','url.png'),(105,NULL,NULL,'test','url.png'),(106,NULL,NULL,'test','url.png'),(107,NULL,NULL,'test','url.png');
/*!40000 ALTER TABLE `photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photosPost`
--

DROP TABLE IF EXISTS `photosPost`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `photosPost` (
  `photosId` int(11) DEFAULT NULL,
  `postId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photosPost`
--

LOCK TABLES `photosPost` WRITE;
/*!40000 ALTER TABLE `photosPost` DISABLE KEYS */;
INSERT INTO `photosPost` VALUES (1,1),(1,6),(2,17),(3,17),(61,17),(62,17);
/*!40000 ALTER TABLE `photosPost` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post`
--

DROP TABLE IF EXISTS `post`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(1000) DEFAULT NULL,
  `content` text,
  `user` int(11) DEFAULT NULL,
  `published` int(1) DEFAULT '0',
  `updatedAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post`
--

LOCK TABLES `post` WRITE;
/*!40000 ALTER TABLE `post` DISABLE KEYS */;
INSERT INTO `post` VALUES (7,'Test post','<p>test content</p>',1,NULL,'2014-08-28 18:40:35','2014-08-28 18:40:35'),(8,'test 2','<p>tssdfsd</p>',1,1,'2014-08-28 19:30:24','2014-08-28 19:30:24'),(17,'test',NULL,1,NULL,'2014-08-29 16:23:41','2014-08-29 12:05:45');
/*!40000 ALTER TABLE `post` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postProduct`
--

DROP TABLE IF EXISTS `postProduct`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `postProduct` (
  `postId` int(11) DEFAULT NULL,
  `productId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postProduct`
--

LOCK TABLES `postProduct` WRITE;
/*!40000 ALTER TABLE `postProduct` DISABLE KEYS */;
INSERT INTO `postProduct` VALUES (1,1),(6,1);
/*!40000 ALTER TABLE `postProduct` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `postTag`
--

DROP TABLE IF EXISTS `postTag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `postTag` (
  `tagId` int(11) DEFAULT NULL,
  `postId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `postTag`
--

LOCK TABLES `postTag` WRITE;
/*!40000 ALTER TABLE `postTag` DISABLE KEYS */;
INSERT INTO `postTag` VALUES (1,2),(2,2),(1,3),(2,3),(2,1),(1,6),(2,6);
/*!40000 ALTER TABLE `postTag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `product` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `name` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (1,'2014-08-28 00:43:38','2014-08-28 00:43:38','test');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(1000) DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'Front Admin',NULL,NULL),(2,'Backend Admin',NULL,NULL),(3,'Roles Editor',NULL,NULL);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roleUser`
--

DROP TABLE IF EXISTS `roleUser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roleUser` (
  `roleId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roleUser`
--

LOCK TABLES `roleUser` WRITE;
/*!40000 ALTER TABLE `roleUser` DISABLE KEYS */;
INSERT INTO `roleUser` VALUES (3,2),(1,1),(2,1);
/*!40000 ALTER TABLE `roleUser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(1000) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
INSERT INTO `tag` VALUES (1,'info',NULL,NULL),(2,'introdaction',NULL,NULL),(3,'document',NULL,NULL);
/*!40000 ALTER TABLE `tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(1000) DEFAULT NULL,
  `email` varchar(1000) DEFAULT NULL,
  `password` varchar(1000) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Admin','admin@yandex.ru','123456',NULL,NULL),(2,'Bob','bob@mailinator.com','123456',NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-08-30 22:27:51
