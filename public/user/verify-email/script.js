const verifybtn = document.querySelector('.btn-verify');
const homebtn = document.querySelector('.btn-home');
const msgBoard = document.querySelector('.msgboard');
const msgBoardText = document.querySelector('.msgboard--text');

verifybtn.addEventListener('click', () => {
  let errResponseCode = 200;
  let errResponseMSG = '';
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });

  axios({
    method: 'post',
    url: '/api/v1/auth/verify-email',
    data: {
      verificationToken: params.token,
      email: params.email,
    },
  })
    .catch(err => {
      errResponseCode = err.response.status;
      errResponseMSG = err.response.data.msg;
    })
    .finally(() => {
      if (errResponseCode === 200) {
        window.location.replace('/');
        // window.location.href = '/';
      } else {
        msgBoardText.textContent = errResponseMSG;
        msgBoard.style.display = 'block';
      }
    });
});

homebtn.addEventListener('click', function () {
  window.location.replace('/');
});
