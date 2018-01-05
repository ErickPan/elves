import django
from django.conf.urls import patterns, include, url


urlpatterns = [
    #django.conf.urls.url(r'', 'main.view.login', name='login'),
    django.conf.urls.url(r'^login/$', 'main.view.login', name='login'),
    django.conf.urls.url(r'^register/$', 'main.view.register', name='register'),
    django.conf.urls.url(r'^welcome/$', 'main.view.welcome', name='welcome'),
    django.conf.urls.url(r'^partition_manager/$', 'main.view.partition_manager', name='partition_manager'),
    django.conf.urls.url(r'^insert/$', 'main.view.insert', name='insert'),
    django.conf.urls.url(r'^delete/$', 'main.view.delete', name='delete'),
    django.conf.urls.url(r'^update/$', 'main.view.update', name='update'),
    django.conf.urls.url(r'^mail_manager/$', 'main.view.mail_manager', name='mail_manager'),
    django.conf.urls.url(r'^get_schema_info/$', 'main.view.get_schema_info', name='get_schema_info'),
    django.conf.urls.url(r'^get_server_proxy_info/$', 'main.view.get_server_proxy_info', name='get_server_proxy_info'),
    django.conf.urls.url(r'^get_mailuser_info/$', 'main.view.get_mailuser_info', name='get_mailuser_info'),
    django.conf.urls.url(r'^inception/$', 'main.view.inception', name='inception'),
    django.conf.urls.url(r'^check_sql/$', 'main.view.check_sql', name='check_sql'),
    django.conf.urls.url(r'^db_server_manager/$', 'main.view.db_server_manager', name='db_server_manager'),
]


