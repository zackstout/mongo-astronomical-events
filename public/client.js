
// console.log('what up');

$(document).ready(() => {
  $('#search').focus();
  $('#submit').on('click', () => {
    console.log($('#search').val());
    console.log($('#year').val());

    $('.output').html('');

    $.ajax({
      type: "GET",
      url: `/astro?search=${$('#search').val()}&year=${$('#year').val()}`,
      success: (data) => {
        console.log(data);
        data.forEach(d => {
          $('.output').append(`<ul>
            <li>Date: ${d.date} </li>
            <li>Type: ${d.type} </li>
            <li>Description: ${d.desc} </li>
            </ul>`);
        });

      }
    });
  });

  $('#submit2').on('click', () => {
    console.log($('#type').val());

    $('.output2').html('');

    $.ajax({
      type: "GET",
      url: `/fromnow?type=${$('#type').val()}`,
      success: (data) => {
        console.log(data);
        data.forEach(d => {
          $('.output2').append(`<ul>
            <li>Date: ${d.date} </li>
            <li>Type: ${d.type} </li>
            <li>Description: ${d.desc} </li>
            </ul>
            <p>
            <button data-id=${d._id} class='remind'>Remind me</button>
            </p>`);
        });

      }
    });
  });


  $(document).on('click', '.remind', function() {

    var data_id = $(this).attr('data-id');
    $.ajax({
      type: "GET",
      url: `/remind?id=${data_id}`,
      success: (data) => {
        console.log('ahoy hoy!');

        
      }

    });
  });
});
