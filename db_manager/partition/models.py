# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
#
# Also note: You'll have to insert the output of 'django-admin.py sqlcustom [app_label]'
# into your database.
from __future__ import unicode_literals

from django.db import models


class DbManagerUsers(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    name = models.CharField(unique=True, max_length=128)
    pwd = models.CharField(max_length=128)
    create_time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'db_manager_users'

class DbProxyInfo(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    server_name = models.CharField(max_length=50)
    proxy_ip = models.CharField(max_length=50)
    proxy_port = models.CharField(max_length=4)
    db_type = models.CharField(max_length=50)
    description = models.CharField(max_length=512)
    create_time = models.DateTimeField()
    update_time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'db_proxy_info'


class DbServerInfo(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    server_name = models.CharField(max_length=50)
    server_ip = models.CharField(max_length=50)
    server_port = models.CharField(max_length=4)
    server_type = models.CharField(max_length=50)
    db_type = models.CharField(max_length=50)
    schema_name = models.CharField(max_length=50)
    environment = models.CharField(max_length=50, blank=True)
    description = models.CharField(max_length=512)
    create_time = models.DateTimeField()
    update_time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'db_server_info'


class DjangoMigrations(models.Model):
    id = models.IntegerField(primary_key=True)  # AutoField?
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class MbTableConfig(models.Model):
    table_id = models.IntegerField(primary_key=True)
    schema_name = models.CharField(max_length=64)
    table_name = models.CharField(max_length=128)
    forward_day = models.IntegerField()
    clear_before_day = models.IntegerField()
    create_time = models.BigIntegerField()
    update_time = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'mb_table_config'
