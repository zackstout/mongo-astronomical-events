
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
});
