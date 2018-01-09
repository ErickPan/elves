#coding:utf-8
import time
import models
from django.shortcuts import render
from django import forms
from django.http import HttpResponseRedirect,HttpResponse, JsonResponse
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.forms.models import model_to_dict
import json    #返回json
import sys
reload(sys)
sys.setdefaultencoding( "utf-8" )

#定义登陆验证装饰器,通过url访问每个函数均需要验证是否登陆
def auth(func):
    def wrapper(request,*args, **kwargs):
        username_cookie = request.COOKIES.get('userlogin_username')
        if username_cookie:
            return func(request,*args, **kwargs)
        else:
            return render_to_response('login.html')
    return wrapper

#定义register页,暂时不用
def register(request):
    return render_to_response('register.html')
#定义login页
def login(request):
    username_cookie = request.COOKIES.get('userlogin_username')
    if username_cookie:
        print username_cookie
        return render_to_response('welcome.html',{})
    else:
        name = request.POST.get('username')
        pwd = request.POST.get('userpass')
        status=''
        try:
            username = models.DbManagerUsers.objects.filter(name=name)
            if len(username)==1:
                username_userpass = models.DbManagerUsers.objects.filter(name=name, pwd=pwd)
                if len(username_userpass)==1:
                    response = render_to_response('welcome.html',{})
                    username = request.COOKIES.get('userlogin_username')
                    if username:
                        pass
                    else:
                        response.set_cookie('userlogin_username',name,36000)
                    return response
                else:
                    status = '密码错误，请重新输入'
                    return render_to_response('login.html', {'status': status})
            else:
                status = '请输入正确的用户名'
                return render_to_response('login.html', {'status': status})
        except Exception,ex:
            print ex

####################################################分区表管理模块####################################################
#分区表渲染页面
def partition_manager(request):
    username_cookie = request.COOKIES.get('userlogin_username')
    if username_cookie:
        pages = request.POST.get('front_pages')
        schema_name = request.POST.get('schema_name')
        # 正常查询
        if schema_name == None:
            schema_name=''
            table_config_list = models.MbTableConfig.objects.all()
            count = len(table_config_list)
            if pages==None:
                table_config_list = models.MbTableConfig.objects.all()[0:10]
                return render(request, 'partition_manager.html',{'table_config_list': table_config_list, 'count': count,'schema_name':schema_name})
            else:
                page=int(pages)
                limit = page * 10
                offset = (page - 1) * 10
                status = ''
                message = ''
                try:
                   table_config_list = models.MbTableConfig.objects.all()[offset:limit]
                   list = []
                   for i in table_config_list:
                       u = model_to_dict(i)
                       list.append(u)
                   message = page
                   status = 'ok'
                   return HttpResponse(json.dumps({"messages": count, 'status': status, 'data': list}))
                except Exception, ex:
                   status = 'failure'
                   return HttpResponse(json.dumps({"messages": ex, 'status': status}))
        # 模糊搜索
        elif schema_name !=None:
             table_config_list = models.MbTableConfig.objects.filter(schema_name__icontains=schema_name)
             count = len(table_config_list)
             if pages == None:
                 table_config_list = models.MbTableConfig.objects.filter(schema_name__icontains=schema_name)[0:10]
                 return render(request, 'partition_manager.html',{'table_config_list': table_config_list, 'count': count,'schema_name':schema_name})
             else:
                 page=int(pages)
                 limit = page * 10
                 offset = (page - 1) * 10
                 status = ''
                 message = ''
                 try:
                     table_config_list = models.MbTableConfig.objects.filter(schema_name__icontains=schema_name)[offset:limit]
                     list = []
                     for i in table_config_list:
                         u = model_to_dict(i)
                         list.append(u)
                     message = page
                     status = 'ok'
                     return HttpResponse(json.dumps({"messages": count, 'status': status, 'data': list}))
                 except Exception, ex:
                     status = 'failure'
                     return HttpResponse(json.dumps({"messages": ex, 'status': status}))
    else:
        return render_to_response('login.html')

# 添加分区配置信息
def insert(request):
    request.encoding = 'utf-8'
    username_cookie = request.COOKIES.get('userlogin_username')
    print username_cookie
    if username_cookie:
        sname = request.POST.get('schema_name')
        tname = request.POST.get('table_name')
        fwd = request.POST.get('forward_day')
        cbd = request.POST.get('clear_before_day')
        print sname, tname, fwd, cbd
        status = ''
        description = ''
        ctime = int(round(time.time() * 1000))
        utime = int(round(time.time() * 1000))
        try:
            dic = {'schema_name': sname, 'table_name': tname, 'forward_day': fwd, 'clear_before_day': cbd,
                   'create_time': ctime, 'update_time': utime}
            models.MbTableConfig.objects.create(**dic)
            status = 'ok'
            return HttpResponse(json.dumps({'status': status}))
        except Exception, ex:
            print ex
            status = str(ex)
            return HttpResponse(json.dumps({'status': status}))
    else:
        return render_to_response('login.html')

# 修改已有分区信息
def update(request):
    request.encoding='utf-8'
    username_cookie = request.COOKIES.get('userlogin_username')
    print username_cookie
    if username_cookie:
        tid = request.POST.get('table_id')
        cbd = request.POST.get('clear_before_day')
        fd = request.POST.get('forward_day')
        update_status = ''
        try:
            obj = models.MbTableConfig.objects.get(table_id=tid)
            obj.clear_before_day = cbd
            obj.forward_day = fd
            obj.save()
            update_status = 'ok'
            return HttpResponse(json.dumps({"status": update_status}))
        except Exception,ex:
            update_status = 'failure'
            return HttpResponse(json.dumps({"status": update_status}))
    else:
        return render_to_response('login.html')

# 删除已有分区信息
def delete(request):
    delete_status = ''
    request.encoding='utf-8'
    username_cookie = request.COOKIES.get('userlogin_username')
    print username_cookie
    if username_cookie:
        tid = request.POST.get('table_id')
        try:
            models.MbTableConfig.objects.filter(table_id=tid).delete()
            delete_status = 'ok'
            return HttpResponse(json.dumps({"status": delete_status}))
        except Exception,ex:
            delete_status = 'failure'
            return HttpResponse(json.dumps({"status": delete_status}))
    else:
        return render_to_response('login.html')

####################################################邮件模块####################################################
#邮件申请主页
@auth
def mail_manager(request):
    server_name_list = models.DbProxyInfo.objects.all().values('server_name').exclude(server_name__iendswith='b')
    list = []
    for i in server_name_list:
        list.append(i)
    data = json.dumps(list)
    return render(request, 'mail_manager.html', {'server_name_list': data})

# 获取数据库实例对应的库名
@auth
def get_schema_info(request):
    import mysql.connector
    request.encoding = 'utf-8'
    db_config = {}
    server_name = request.POST.get('server_name')
    key_words_schema = request.POST.get('key_words')
    server_proxy_list = models.DbProxyInfo.objects.all().values('server_name','proxy_ip','proxy_port').filter(server_name=server_name)
    server_proxy_dic = server_proxy_list[0]
    proxy_ip = server_proxy_dic['proxy_ip']
    proxy_port = server_proxy_dic['proxy_port']
    db_server_user = 'elves_ro'
    db_server_pass = 'pwVUwffHnC9AHAW4'
    db_config['host'] = proxy_ip
    db_config['port'] = proxy_port
    db_config['user'] = db_server_user
    db_config['password'] = db_server_pass
    schema = key_words_schema +'%'
    cnx = mysql.connector.connect(**db_config)
    cursor = cnx.cursor()
    query_schemas = ("select schema_name from information_schema.schemata where schema_name like \'%s\';" %(schema))
    cursor.execute(query_schemas)
    query_schemas_results = cursor.fetchall()
    cnx.close()
    direct = []
    for one in query_schemas_results:
        a = {}
        a['schema_name'] = one[0]
        direct.append(a)
    return HttpResponse(json.dumps({'data': direct}))


# 获取邮件账号
@auth
def get_mailuser_info(request):
    request.encoding = 'utf-8'
    key_words_mailuser= request.POST.get('key_words_mailuser')
    mailuser_queryset = models.DbManagerUsers.objects.all().values('name').filter(name__icontains=key_words_mailuser)
    list = []
    for i in mailuser_queryset:
        list.append(i)
    data = json.dumps(list)
    return HttpResponse(json.dumps({'data': list}))


# 获取线下服务器代理线上服务器信息
@auth
def get_server_proxy_info(request):
    request.encoding = 'utf-8'
    server_info_list = models.DbProxyInfo.objects.all().values('server_name', 'proxy_ip', 'proxy_port','db_type', 'description')
    return render_to_response('server_proxy_info.html', {'server_info_list': server_info_list})

####################################################inception表结构审核####################################################
@auth
def inception(request):
    server_name_list = models.DbProxyInfo.objects.all().values('server_name').exclude(server_name__iendswith='b')
    list = []
    for i in server_name_list:
        list.append(i)
    data = json.dumps(list)
    return render(request, 'inception.html', {'server_name_list': data})

#表结构审核代码
@auth
def check_sql(request):
    import MySQLdb
    server_name = request.POST.get('server_name')
    schema_name = request.POST.get('schema_name')
    sql_content = request.POST.get('sql_content')
    #从proxy配置表获取要连接到远程数据库的信息
    server_proxy_list = models.DbProxyInfo.objects.all().values('server_name', 'proxy_ip', 'proxy_port','mysql_user','mysql_pass').filter(server_name=server_name)
    server_proxy_dic = server_proxy_list[0]
    proxy_ip = server_proxy_dic['proxy_ip']
    proxy_port = server_proxy_dic['proxy_port']
    user_name = server_proxy_dic['mysql_user']
    user_pass = server_proxy_dic['mysql_pass']
    sql_pre = """/*--user=%s;--password=%s;--host=%s;--execute=1;--port=%s;*/\
        inception_magic_start;
        set names utf8;
        use %s;
        %s
        inception_magic_commit;""" % (user_name, user_pass, proxy_ip, proxy_port,schema_name,sql_content)
    sql = sql_pre.encode("utf-8")
    print sql
    try:
        conn = MySQLdb.connect(host='192.168.3.20', user='', passwd='', db='', port=6669,charset="utf8")
        cur = conn.cursor()
        ret = cur.execute(sql)
        result = cur.fetchall()
        num_fields = len(cur.description)
        field_names = [i[0] for i in cur.description]
        print field_names
        for row in result:
            print row[0], "¦",row[1],"¦",row[2],"¦",row[3],"¦",row[4],"¦",row[5],"¦",row[6],"¦",row[7],"¦",row[8],"¦",row[9],"¦",row[10]
            check_info = row[4]
        cur.close()
        conn.close()
        print check_info
        return HttpResponse(json.dumps({"exec_status": check_info}))
    except MySQLdb.Error, e:
        print "Mysql Error %d: %s" % (e.args[0], e.args[1])
####################################################db服务器资源管理模块####################################################
#db资源管理渲染页面
@auth
def db_server_manager(request):
    pages = request.POST.get('front_pages')
    db_type = request.POST.get('db_type')
    print db_type,pages
    # 正常查询
    if db_type == None:
        db_type=''
        server_list = models.DbServerInfo.objects.all()
        count = len(server_list)
        if pages==None:
            server_list = models.DbServerInfo.objects.all()[0:10]
            return render(request, 'db_server.html',{'server_list': server_list, 'count': count,'db_type':db_type})
        else:
            page=int(pages)
            limit = page * 10
            offset = (page - 1) * 10
            status = ''
            message = ''
            try:
               table_config_list = models.DbServerInfo.objects.all()[offset:limit]
               list = []
               for i in table_config_list:
                   u = model_to_dict(i)
                   list.append(u)
               message = page
               status = 'ok'
               return HttpResponse(json.dumps({"messages": count, 'status': status, 'data': list}))
            except Exception, ex:
               status = 'failure'
               return HttpResponse(json.dumps({"messages": ex, 'status': status}))
    # 模糊搜索
    elif db_type !=None:
         table_config_list = models.DbServerInfo.objects.filter(db_type__icontains=db_type)
         count = len(table_config_list)
         if pages == None:
             server_list = models.DbServerInfo.objects.filter(db_type__icontains=db_type)[0:10]
             return render(request, 'db_server.html',{'server_list': server_list, 'count': count,'db_type':db_type})
         else:
             page=int(pages)
             limit = page * 10
             offset = (page - 1) * 10
             status = ''
             message = ''
             try:
                 server_list = models.DbServerInfo.objects.filter(db_type__icontains=db_type)[offset:limit]
                 list = []
                 for i in server_list:
                     u = model_to_dict(i)
                     list.append(u)
                 message = page
                 status = 'ok'
                 return HttpResponse(json.dumps({"messages": count, 'status': status, 'data': list}))
             except Exception, ex:
                 status = 'failure'
                 return HttpResponse(json.dumps({"messages": ex, 'status': status}))
