+function (window, document, undefined) {
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
            if (!$('.c-schema').length) {
                schemaNameSearch.setValue('');
                schemaNameSearch.parentGroup().insert(
                    '<button class="btn btn-primary c-label c-schema" type="button">' + name + '<i class="label-clear">╳</i></button>'
                );
            } else {
                alert('库名最多只能添加一个');
            }

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
                schemaNameSearch.setRenderData(data.data);
            });
        }
    });
    new FormGroup('#schema-name', '库名')
    .insert(schemaNameSearch);
    new FormGroup('#exec-content', 'sql语句', 'l-top')
    .insert('<textarea class="form-control sql-sentence" rows="10" placeholder="请输入sql语句"></textarea>');
    var isReturn = true;
    var $error = $('.error-message'),
        $dLog = $error.parent();
    $('.submit-btn').on('click', function () {
        if (isReturn) {
            $error.html('检测中。。。。。。')
            $dLog.show();
            $.ajax({
                type: 'POST',
                url: '/check_sql/',
                dataType: 'json',
                data: {
                    server_name: sendData.server_name,
                    schema_name: $.map($('.c-schema'), function (item) {
                        return item.childNodes[0].nodeValue;
                    }).join(','),
                    sql_content: $('.sql-sentence').val()
                }
            }).then(function (data) {
                $error.html(data.exec_status);
                setTimeout(function () {
                    $dLog.animate({ bottom: 30 - $dLog.height() + 'px'});
                }, 3000);
            }).always(function () {
                isReturn = true;
            });
            isReturn = false;
        }
       
    });
    $dLog.hover(function () {
        $dLog.stop().animate({ bottom: 0 });
    }, function () {
        $dLog.stop().animate({ bottom: 30 - $dLog.height() + 'px' });
    });
    $('.condit-query').on('click', '.label-clear', function () {
        $(this).parent('.c-label').remove();
    });
} (window, document, undefined);