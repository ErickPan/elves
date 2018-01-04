import django
from django.conf.urls import patterns, include, url


urlpatterns = [
    #django.conf.urls.url(r'', 'partition.view.login', name='login'),
    django.conf.urls.url(r'^login/$', 'partition.view.login', name='login'),
    django.conf.urls.url(r'^register/$', 'partition.view.register', name='register'),
    django.conf.urls.url(r'^welcome/$', 'partition.view.welcome', name='welcome'),
    django.conf.urls.url(r'^partition_manager/$', 'partition.view.partition_manager', name='logout'),
    django.conf.urls.url(r'^insert/$', 'partition.view.insert', name='logout'),
    django.conf.urls.url(r'^delete/$', 'partition.view.delete', name='logout'),
    django.conf.urls.url(r'^update/$', 'partition.view.update', name='logout'),
    django.conf.urls.url(r'^mail_manager/$', 'partition.view.mail_manager', name='logout'),
    django.conf.urls.url(r'^get_schema_info/$', 'partition.view.get_schema_info', name='logout'),
    django.conf.urls.url(r'^get_server_proxy_info/$', 'partition.view.get_server_proxy_info', name='logout'),
    django.conf.urls.url(r'^get_mailuser_info/$', 'partition.view.get_mailuser_info', name='logout'),
    django.conf.urls.url(r'^inception/$', 'partition.view.inception', name='logout'),
    django.conf.urls.url(r'^check_sql/$', 'partition.view.check_sql', name='logout'),
    django.conf.urls.url(r'^db_server_manager/$', 'partition.view.db_server_manager', name='logout'),
]


