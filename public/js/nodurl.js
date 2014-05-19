function format() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {
    var reg = new RegExp("\\{" + i + "\\}", "gm");
    s = s.replace(reg, arguments[i + 1]);
  }
  return s;
}

var tmpl = '<tr><td><a href="http://{3}/{0}" target="_blank">http://{3}/{0}</a></td><td>{0}</td><td>{1}</td><td>{2}</td><td><button type="button" class="btn_edit btn btn-primary btn-xs" data-id="{0}">Edit</button><button type="button" class="btn_remove btn btn-danger btn-xs" data-id="{0}">Remove</button></td></tr>';

$(document).ready(function() {
  $.get('/urls', function(data) {
    for (var i = data.length - 1; i >= 0; i--) {
      $("#main_table").append(format(tmpl, data[i].urly, data[i].destination, data[i].type, document.domain));
    }
  });

  $(document).on('click', '.btn_edit', function(e) {
    $('.btn_created').html('Save');
    $('.creatediv').show();
    $('#field_urly').val($(this).attr('data-id'));
  });

  $(document).on('click', '.btn_remove', function(e) {
    var elem = this;

    $.ajax({
      url: '/remove/'+$(this).attr('data-id'),
      data: {},
      success: function(data) {
        if(data.result === true) {
          $(elem).parent().parent().remove();    
        }
      },
      dataType: 'json',
      type: 'DELETE'
    });
  });

  $('.btn_create').click(function(e) {
    $('.btn_created').html('Create');
    $('#field_urly').val('');
    $('.creatediv').show();
    return false;
  });

  $('.btn_cancel').click(function(e) {
    $('.creatediv').hide();
    return false;
  });
});