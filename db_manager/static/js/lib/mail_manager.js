+function (window, document, $) {
    var _exports = window.exports;
    var SearchBox = _exports.SearchBox;
    var Dropdown = _exports.Dropdown;
    var FormGroup = _exports.FormGroup;
    var sendData = {};
    var search = {
        timer: null,
        id: 0,
        progress: 0,
        request: function (params, suCb, faCb) {
            var self = this;
            suCb = suCb || function () {};
            faCb = faCb || function () {};
            function exec (id, cb, data) {
                if (self.progress <= id) {
                    self.progress = id;
                    cb(data);
                }
            }
            if (!self.timer) {
                self.timer = setTimeout(function () {
                    var id = self.id++;
                    $.ajax(params).then(function (data) {
                        exec(id, suCb, data);
                    }).fail(function (err) {
                        exec(id, faCb, err);
                    });
                    clearTimeout(self.timer);
                    self.timer = null;
                }, 50);
            }
        }
    };
    new FormGroup('#server-name', '主机名')
        .insert(new Dropdown({
            defaultText: '选择主机名',
            onChange: function (name) {
                sendData.server_name = name;
            },
            downList: server_name_list,
            renderItem: function (item) {
                return item.server_name;
            }
        }));
    var schemaNameSearch = new SearchBox({
        placeholder: '搜索库名',
        onChange: function (name) {
            schemaNameSearch.setValue('');
            schemaNameSearch.parentGroup().insert(
                '<button class="btn btn-primary c-label c-schema" type="button">' + name + '<i class="label-clear">╳</i></button>'
            );
        },
        renderItem: function (item) {
            return item.schema_name;
        },
        onKeyUp: function (val) {
            search.request({
                type: 'POST',
                url: '/get_schema_info/',
                data: {
                    key_words: val,
                    server_name: sendData.server_name
                },
                dataType: 'json'
            }, function (data) {
                console.log(data,'ffffffff');
                schemaNameSearch.setRenderData(data.data);
            });
        }
    });

    new FormGroup('#schema-name', '库名')
        .insert(schemaNameSearch);

    new FormGroup('#sql-type', 'SQL类型')
        .insert(new Dropdown({
            defaultText: '选择SQL类型',
            onChange: function (type, index) {
                if (index) {
                    sendData.type = type;
                    this.parentGroup().insert(
                        '<button class="btn btn-primary c-label c-type" type="button">' + type + '<i class="label-clear">╳</i></button>'
                    );
                }
            },
            downList: [
                'insert',
                'delete',
                'update',
                'select',
                'drop',
                'create',
                'alter'
            ],
            renderItem: function (item) {
                return item;
            }
        }));
    new FormGroup('#sql-privilege', '申请权限')
        .insert(new Dropdown({
            defaultText: '选择权限',
            onChange: function (privilege, index) {
                if (index) {
                    sendData.privilege = privilege;
                    this.parentGroup().insert(
                        '<button class="btn btn-primary c-label c-privilege" type="button">' + privilege + '<i class="label-clear">╳</i></button>'
                    );
                }

            },
            downList: [
                'insert',
                'delete',
                'update',
                'select'
            ],
            renderItem: function (item) {
                return item;
            }
        }));
    new FormGroup('#sql-migration', 'migration')
        .insert(new Dropdown({
            defaultText: '请选择git分支',
            onChange: function (migration) {
                sendData.migration = migration;
            },
            downList: [
                'dbg_ci_qa',
                'dbg_yf_release',
                'release'
            ],
            renderItem: function (item) {
                return item;
            }
        }));
    var addresseeSearch = new SearchBox({
        placeholder: '搜索收件人',
        onChange: function (name) {
            addresseeSearch.setValue('');
            addresseeSearch.parentGroup().insert(
                '<button class="btn btn-primary c-label c-addre" type="button">' + name + '<i class="label-clear">╳</i></button>'
            );
        },
        renderItem: function (item) {
            return item.name;
        },
        onKeyUp: function (val) {
            search.request({
                type: 'POST',
                url: '/get_mailuser_info/',
                data: {
                    key_words_mailuser: val
                },
                dataType: 'json'
            }, function (data) {
                addresseeSearch.setRenderData(data.data);
            });
        }
    });
    new FormGroup('#addressee', '收件人')
        .insert(addresseeSearch);

    var ccListSearch = new SearchBox({
        placeholder: '搜索抄送人',
        onChange: function (name) {
            ccListSearch.setValue('');
            ccListSearch.parentGroup().insert(
                '<button class="btn btn-primary c-label c-clist" type="button">' + name + '<i class="label-clear">╳</i></button>'
            );
        },
        onKeyUp: function (val) {
            search.request({
                type: 'POST',
                url: '/get_mailuser_info/',
                data: {
                    key_words_mailuser: val
                },
                dataType: 'json'
            }, function (data) {
                ccListSearch.setRenderData(data.data);
            });
        },
        // downList: [
        //     { schema_name: 21313},
        //     { schema_name: 21312}
        // ],
        renderItem: function (item) {
            return item.name;
        }
    });

    new FormGroup('#cc-list', '抄送人')
        .insert(ccListSearch);

    new FormGroup('#effect-line', '影响行数')
        .insert('<input type="text" class="form-control effect-l" placeholder="请输入影响行数">');
    new FormGroup('#sql-version', 'SQL文件版本')
        .insert('<input type="text" class="form-control sql-v" placeholder="请输入SQL文件版本">');

    new FormGroup('#remarks', '内容', 'l-top')
        .insert('<textarea class="form-control mail-remarks" rows="10" placeholder="@审批人名字，选择项目组组长或leader，并说明申请原因，用来做什么；sql或sql文件在邮件客户端输入"></textarea>');

    $('.condit-query').on('click', '.label-clear', function () {
        $(this).parent('.c-label').remove();
    });
    var $index,
        keyModel = '',
        $tabs = $('.tab-item');

    function tabItem () {
        var hash = location.hash.replace('#', '') || 'sql-apply';
        $tabs.removeClass('active');
        $('.active-group').hide();
        $('.c-label').remove();
        $('.effect-l').val('');
        $('.mail-remarks').val('');
        $('.sql-v').val('');
        switch (hash) {
            case 'sql-apply':
                $tabs.eq(0).addClass('active');
                $('#sql-type').show();
                $('#effect-line').show();
                $index = 0;
                keyModel = '\r\n【sql类型】：' + sendData.type +
                            '<br>【影响行数】：' + $('.effect-l').val();
                break;
            case 'privilege-apply':
                $tabs.eq(1).addClass('active');
                $('#sql-privilege').show();
                $index = 1;
                keyModel = '<br>【申请权限】：' + sendData.privilege ;
                break;
            case 'migration-apply':
                $tabs.eq(2).addClass('active');
                $('#sql-migration').show();
                $('#sql-version').show();
                $index = 2;
                keyModel = '<br>【git分支】：' + sendData.migration +
                            '<br>【sql文件版本】：' + $('.sql-v').val();
                break;
        }

    }
    tabItem();
    window.addEventListener('hashchange', function () {
        tabItem();
    }, false);
    $('.submit-btn').on('click', function (e) {
        switch ($index) {
            case 0:
                keyModel = '<br>【sql类型】：' + $.map($('.c-type'), function (item) {
                                return item.childNodes[0].nodeValue;
                            }).join(',') +
                            '<br>【影响行数】：' + $('.effect-l').val() +
                            '<br>【sql语句】：';
                break;
            case 1:
                keyModel = '<br>【申请权限】：' + $.map($('.c-privilege'), function (item) {
                        return item.childNodes[0].nodeValue;
                    }).join(',') ;
                break;
            case 2:
                keyModel = '<br>【git分支】：' + sendData.migration +
                            '<br>【sql文件版本】：' + $('.sql-v').val();
                break;
        }
        window.location.href = 'mailto:' + $.map($('.c-addre'), function (item) {

            return item.childNodes[0].nodeValue;
        }).join(',') + '?cc=' + $.map($('.c-clist'), function (item) {
            return item.childNodes[0].nodeValue;
        }).join(',')+ '&subject=' + $tabs.eq($index).children().text() +
        '&body='+ $('.mail-remarks').val() +
        '<br>【主机名】：' + sendData.server_name +
        '<br>【数据库名】：' + $.map($('.c-schema'), function (item) {
            return item.childNodes[0].nodeValue
        }).join(',') + keyModel;

    });




}(window, document, $ || jQuery);
