/*
Navicat MySQL Data Transfer

Source Server         : @localhost
Source Server Version : 50505
Source Host           : localhost:3306
Source Database       : qbbot

Target Server Type    : MYSQL
Target Server Version : 50505
File Encoding         : 65001

Date: 2017-10-28 18:02:49
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for auto_del_configs
-- ----------------------------
DROP TABLE IF EXISTS `auto_del_configs`;
CREATE TABLE `auto_del_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `exempt_label` varchar(255) DEFAULT NULL,
  `max_disk_usage_size_gb` int(11) DEFAULT NULL,
  `createdAt` datetime(6) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for box_configs
-- ----------------------------
DROP TABLE IF EXISTS `box_configs`;
CREATE TABLE `box_configs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `url` longtext,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `basic_auth_username` longtext,
  `basic_auth_password` longtext,
  `client_type` int(11) DEFAULT NULL,
  `max_disk_usage_size_gb` int(11) DEFAULT NULL,
  `autodel_exempt_label` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for exceptions
-- ----------------------------
DROP TABLE IF EXISTS `exceptions`;
CREATE TABLE `exceptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `ref_id` int(11) DEFAULT NULL,
  `exception` longtext,
  `createdAt` datetime(6) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for logs
-- ----------------------------
DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `type` int(11) DEFAULT NULL,
  `content` longtext,
  `createdAt` datetime(6) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for rss_feeds
-- ----------------------------
DROP TABLE IF EXISTS `rss_feeds`;
CREATE TABLE `rss_feeds` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `url` longtext,
  `filter` longtext,
  `label` varchar(255) DEFAULT NULL,
  `max_size_mb` int(11) DEFAULT NULL,
  `createdAt` datetime(6) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for rss_feed_torrents
-- ----------------------------
DROP TABLE IF EXISTS `rss_feed_torrents`;
CREATE TABLE `rss_feed_torrents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rss_feed_id` int(11) DEFAULT NULL,
  `torrent_path` longtext,
  `status` int(11) DEFAULT NULL,
  `file_size_kb` int(11) DEFAULT NULL,
  `createdAt` datetime(6) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `url` longtext,
  `title` longtext,
  `pub_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) DEFAULT NULL,
  `createdAt` datetime(6) DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  `enabled` int(2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=0 DEFAULT CHARSET=utf8;
