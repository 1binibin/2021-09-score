/* 
$().method().method //$()가 리턴값의 .method를 가지고있고 또 메서드를 가지고 있어야 체인닝이 됨

$().next()      // 내 바로 다음     - JS: nextSibling
$().prev()      // 내 바로 전       - JS: previousSibling
$().parent()    // 내 부모          - JS: parentNode
$().parents()   // 내 조상들        - JS: parentNode
$().siblings()  // 내 형제자매       
$().children()  // 내 자식          - JS: childNodes
$().find()      // 내 자손          - JS: childNodes
keyup:  키를 누루고 뗄때
keydown: 키를 누를때
keypress: 눌렀을때

jQuery data 처리
1. 실시간
db.on('child_added', onAdded);      //return 추가된 데이터
db.on('child_changed', onChanged);  //return 수정된 데이터
db.on('child_removed', onRemoved);  //return 삭제된 데이터

2.이벤트에 의해서
db.push().key       // 데이터 저장
db.set({})          // 데이터 수정
db.remove()         // 데이터 삭제
db.get()            // 데이터 가져오기
*/

/*************** global init *****************/
var auth = firebase.auth();
var googleAuth = new firebase.auth.GoogleAuthProvider();
var firebaseDatabase = firebase.database();
var firebaseStorage = firebase.storage();
var db = firebaseDatabase.ref('root/board');   // sort를 기준으로 가져옴.
var ref = db.orderByChild('idx')   
var storage = firebaseStorage.ref('root/board');
var user = null;
var allowType = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
var exts = ['../img/jpg.png', '../img/png.png', '../img/gif.png', '../img/video.png'];


/*************** element init *****************/
var btSave = document.querySelector('.write-wrapper .bt-save');      // 글작성
var btLogin = document.querySelector('.header-wrapper .bt-login');   // 로긴버튼
var btLogout = document.querySelector('.header-wrapper .bt-logout'); // 로그아웃 버튼
var btWrite = document.querySelector('.list-wrapper .bt-write');     // 글작성 모달창 오픈버튼
var btWrite2 = document.querySelector('.view-wrapper .bt-write');     // 글작성 모달창 오픈버튼
var btClose = document.querySelector('.write-wrapper .bt-close');    // 글작성 모달창 클로즈버튼
var btReset = document.querySelector('.write-wrapper .bt-reset');    // 글작성 모달창 리셋버튼
var writeWrapper = document.querySelector('.write-wrapper');         // 글작성 모달창
var writeForm = document.writeForm;                                  // 글작성 form , 'form'만 name명 으로 접근가능
var loading = document.querySelector('.write-wrapper .loading-wrap');   // 파일 업로드 로딩바
var tbody = document.querySelector('.list-tbl tbody');
var recent = document.querySelector('.recent-wrapper .list-wp');
var listWrapper = document.querySelector('.list-wrapper');
var viewWrapper = document.querySelector('.view-wrapper');
var updateWrapper = document.querySelector('.update-wrapper');
var tr;

var observer;       //Intersection observer의 Instance
var listCnt = 5;    // 데이터를 한번에 불러올 갯수

/*************** user function  *****************/
function viewShow(el) {
    switch(el){
        case 'LIST':    // 리스트로 돌아가기
            listWrapper.style.display = 'block';
            viewWrapper.style.display = 'none';
            updateWrapper.style.display = 'none';
            break;
        case 'VIEW':    // 뷰페이지가기
        listWrapper.style.display = 'none';
        viewWrapper.style.display = 'block';
        updateWrapper.style.display = 'block';
            break;
        case 'UPDATE':
            listWrapper.style.display = 'none';
            viewWrapper.style.display = 'none';
            updateWrapper.style.display = 'block';
            break;
    }
}

function goView(k, el) {
    // location.href = './view.html?key='+k;    html은 변수를 받지못한다. key만 전달함.
    viewShow('VIEW');
    db
    .child(k)
    .get()
    .then(onGetView)
    .catch(onGetError);
    var nextKey = null;
    var prevKey = null;
    if(el.tagName === 'TD') {
        nextKey = $(el).parent().prev().data('key');
        prevKey = $(el).parent().next().data('key');
    }
    else {
        nextKey = $(el).prev().data('key');
        prevKey = $(el).next().data('key');
    }
}

function listInit() {   // 처음, 데이터를 생성할때 한번씩
    tbody.innerHTML = '';
    ref
        .limitToFirst(listCnt)
        .get()
        .then(onGetData)
        .catch(onGetError);
}

function recentInit(ref) {
    ref
        .limitToFirst(1)
        .get()
        .then(onGetRecent)
        .catch(onGetError);
}

function setHTML(k, v) {    //데이터 넣을때
    var n = tbody.querySelectorAll('tr').length + 1;
    var html = '<tr data-idx="'+v.idx+'" data-key="'+k+'">';
    html += '<td>'+n+'</td>';
    html += '<td  onclick="goView(\''+k+'\', this);">';
    if(v.upfile){
        html += '<img src="'+exts[allowType.indexOf(v.upfile.file.type)]+'" class="icon">';
    }
    html += v.title;
    html += '</td>';
    html += '<td>'+v.writer+'</td>';
    html += '<td>'+moment(v.createdAt).format('YYYY-MM-DD')+'</td>';
    html += '<td>0</td>';
    html += '</tr>';
    tbody.innerHTML += html;
    tr = tbody.querySelectorAll('tr');
    // console.log('setHTML', v);
    observer.observe(tr[tr.length - 1]);
    sortTr();
}

function setRecentHTML(k, v) {
    var html = '<li class="list" data-idx="'+v.idx+'" style="background-image: url(\''+v.upfile.path+'\');">';
    html += '<div class="ratio"></div>';
    html += '</li>';
    recent.innerHTML += html;
}

function sortTr() {
    var total = tbody.querySelectorAll('tr').length;
    tbody.querySelectorAll('tr').forEach(function(v, i) {
        v.querySelector('td').innerHTML = total -i;
    });
}

/*************** event callback *****************/
function onGetView(r) { // 사진이나 글을 클릭하면 생기는 페이지
    console.log('my', r.key);
    viewWrapper.querySelector('.title-wrap .content').innerHTML = r.val().title;  //title을 보여줌.
    viewWrapper.querySelector('.writer-wrap .content').innerHTML = r.val().writer;  
    viewWrapper.querySelector('.datetime-wrap .content').innerHTML = moment(r.val().createAt).format('YYYY-MM-DD HH:mm:ss');  
    viewWrapper.querySelector('.readnum-wrap .content').innerHTML = r.val().readcnt || 0;  
    viewWrapper.querySelector('.content-wrap').innerHTML = r.val().content || '';  
    if(r.val().upfile){
        var html = '';
        if(allowType.indexOf(r.val().upfile.file.type) === 3) {
            html = '<div class="my-3 text-center">';
            html += '<video autoplay muted loop controls class="mw-100">';
            html += '<source src="'+r.val().upfile.path+'"></source>';
            html += '</video>';
            html += '</div>';
        }
        else {
            html = '<div class="my-3 text-center">';
            html += '<img src="'+r.val().upfile.path+'" class="mx-100">';
            html += '</div>';
        }
        viewWrapper.querySelector('.content-wrap').innerHTML += html;
    }
    ref.endBefore(r.val().idx).limitToFirst(1).get().then(onGetPrev).catch(onGetError);
    ref.startAfter(r.val().idx).limitToFirst(1).get().then(onGetNext).catch(onGetError);
    function onGetPrev(r) {
        r.forEach(function(v, i) {
            console.log('prev', v.key);
        });
    }
    function onGetNext(r) {
        r.forEach(function(v, i) {
            console.log('next', v.key);
        });
    }
}

function onObserver(el, observer) {
    el.forEach(function(v) {
        //console.log(v.isIntersecting);
        if(v.isIntersecting) {
            var tr = tbody.querySelectorAll('tr');
            var last = Number(tr[tr.length - 1].dataset['idx']);
            ref.startAfter(last).limitToFirst(listCnt).get().then(onGetData).catch(onGetError);
            // observer.observe(lastTr);
            observer.unobserve(v.target);
            
        }
    });
}

function onGetData(r) {
    r.forEach(function(v, i) {
    // console.log(v.key);
        setHTML(v.key, v.val());
    });
}



function onGetRecent(r) {
    if(r.numChildren() > 0){  //  데이터가 존재함
        r.forEach(function(v, i) {
            
            var isImg = v.val().upfile && v.val().upfile.file.type !== allowType[3];    //upfile이 이미지인 경우.
            if(isImg)   {
                var html = '<li class="list" data-key="'+v.key+'" data-idx="'+v.val().idx+'" style="background-image: url(\''+v.val().upfile.path+'\');" onclick="goView(\''+v.key+'\', this);">';
                html += '<div class="ratio"></div>';
                html += '</li>';
                recent.innerHTML += html;
            }
            var li = recent.querySelectorAll('li');
            var cnt = li.length;
            var last = cnt -1;
            if(last < 5) {   //list가 6개 미만인지
                //console.log('찾는중');
                recentInit(ref.startAfter(v.val().idx));
            }
        });
    }
}

function onGetError(err) {
    console.log(err);
}

// onAuthStateChanged 
function onAuthChanged(r) { // login, logout 상태가 변하면..
    user = r;
    if(user) {  // 로그인 되면 UI가 할일
        btLogin.style.display = 'none';
        btLogout.style.display = 'block';
        btWrite.style.display = 'inline-block';
        btWrite2.style.display = 'inline-block';
    }
    else {  // 로그아웃 되면 UI가 할일
        btLogin.style.display = 'block';
        btLogout.style.display = 'none';
        btWrite.style.display = 'none';
        btWrite2.style.display = 'none';
    }
}

function onLogin() {    // btLogin이 클릭되면
    auth.signInWithPopup(googleAuth);
}

function onLogout() {   //btLogout이 클릭되면
    auth.signOut();
}

function onWrite() {    // 모달창이 오픈 되면.
    loading.style.display = 'none';
    $(writeWrapper).stop().fadeIn(300); //javascript론 까다로워서 jQuery 사용
    writeForm.title.focus();
}

function onClose() {    // 모달창이 닫히면
    $(writeWrapper).stop().fadeOut(300);
    onWriteReset();
}

function onWriteReset(e) {  // form을 원상태로 돌리기
    writeForm.reset();  // button[type="reset"] 클릭한 효과
    writeForm.title.value = '';
    writeForm.title.classList.remove('active');
    writeForm.writer.value = '';
    writeForm.writer.classList.remove('active');
    writeForm.content.value = '';
    document.querySelectorAll('.required-comment').forEach(function(v, i) {
        v.classList.remove('active');
    });
}

function onWriteSubmit(e) { //btSave 클릭시 (글저장시) // validation 검증
	e.preventDefault();
	var title = writeForm.title;
	var writer = writeForm.writer;
	var upfile = writeForm.upfile;
	var content = writeForm.content;
    var upload;
	if(!user) {
        alert('로그인 후 이용하세요.')
        return false;
	}
	if(!requiredValid(writer)) {
		writer.focus();
		return false;
	}
	if(!upfileValid(upfile)) {
		return false;
	}
	// firebase save
    var data = {};
    data.user = user.uid;
    data.title = title.value;
    data.writer = writer.value;
    data.content = content.value;
    data.createAt = new Date().getTime();
    data.readcnt = 0;
    db.limitToLast(1).get().then(getLastIdx).catch(onGetError);
    function getLastIdx(r) {
        if(r.numChildren() === 0){
            data.idx = 99999999;
        }
        else {
            r.forEach(function(v) {
            data.idx = Number(v.val().idx) - 1;
            });
        }

        if(upfile.files.length) {       // 파일이 존재하면 처리 로직
            var file = {
                name: upfile.files[0].name,
                size: upfile.files[0].size,
                type: upfile.files[0].type
            }
            var savename = genFile();
            var uploader = storage.child(savename.folder).child(savename.file).put(upfile.files[0]);
            uploader.on('state_changed', onUploading, onUploadError, onUploaded);
            data.upfile = { folder: 'root/board/'+savename.folder, name: savename.file, file: file };
        }
        else {
            saveAfter();
        }
    }
    

    function onUploading(snapshot) { // 파일이 업로드 되는 동안
        loading.style.display = 'flex';
        upload = snapshot;
    }
    
    function onUploaded() {     //파일업로드 완료 후
        upload.ref.getDownloadURL().then(onSuccess).catch(onError); //getDownloadURL 다운로드 주소
    }
    
    function onUploadError(err) {   // 파일 업로드 실패
        loading.style.display = 'none';
        console.log('error', err);
        if(err.code === 'storage/unauthorized') location.href = '../403.html'
        else {
            alert('파일 업로드에 실패하였습니다. 관리자에게 문의 후 다시 시도해 주세요.');
            console.log('error',err);
        }
    }

    function onSuccess(r) { // r: 실제 웹으로 접근 가능한 경로
        data.upfile.path = r;
        saveAfter();
    } 

    function onError(err) {
        alert('파일 가져오기에 실패 하였습니다. 다시 시도해 주세요.');
        console.log(err);
    }

    function saveAfter() {
        db.push(data).key;  //firebase 저장
        onClose();
        listInit();
        recent.innerHTML = '';
        recentInit(ref);
        viewShow('LIST');
    }
}




function onRequiredValid(e) {  // title, writer에서 blur되거나 keyup되면
    //var el = this; //e.target;
    requiredValid(this)
}

function requiredValid(el) {    // 입력하지 않으면 하단에 required-comment 나타남
    var next = $(el).next()[0];    // js: e.target.nextSibling 공백 까지 찾는다..
    if(el.value.trim() === '') {
        el.classList.add('active');
        next.classList.add('active');
        return false;
    }
    else {
        el.classList.remove('active');
        next.classList.remove('active');
        return true;
    }
    
}


function onUpfileChange(e) {    // upfile에서 change 되면
    upfileValid(this)
}

function upfileValid(el) {
	var next = $(el).next()[0];
	if(el.files.length > 0 && allowType.indexOf(el.files[0].type) === -1) {
		el.classList.add('active');
		next.classList.add('active');
		return false; 
	}
	else {
		el.classList.remove('active');
		next.classList.remove('active');
		return true;
	}
}

function onLoadingClick(e) {    // 로딩바가 돌때 클릭 막기
    e.stopPropagation();
    e.preventDefault();
}

/*************** event init *****************/
auth.onAuthStateChanged(onAuthChanged);
btLogin.addEventListener('click', onLogin);
btLogout.addEventListener('click', onLogout);
btWrite.addEventListener('click', onWrite);
btWrite2.addEventListener('click', onWrite);
btClose.addEventListener('click', onClose);
btReset.addEventListener('click', onWriteReset);
writeForm.addEventListener('submit', onWriteSubmit);
writeForm.title.addEventListener('blur', onRequiredValid);
writeForm.title.addEventListener('keyup', onRequiredValid);
writeForm.writer.addEventListener('keyup', onRequiredValid);
writeForm.writer.addEventListener('blur', onRequiredValid);
writeForm.upfile.addEventListener('change', onUpfileChange);
loading.addEventListener('click', onLoadingClick);


//db.on('child_added', onAdded);
// db.on('child_changed', onChanged);
// db.on('child_removed', onRemoved);

/*************** start init *****************/
observer = new IntersectionObserver(onObserver, {root: null, rootMargin: '-100px'} );
listInit();
recent.innerHTML = '';
recentInit(ref);


/* var isImg = v.val().upfile && v.val().upfile.file.type !== allowType[3];    //upfile이 이미지인 경우.
            if(isImg) setRecentHTML(v.key, v.val());
            else {  // 이미지가 아니면
                if(!recent.querySelector('li')) {
                    var li = recent.querySelectorAll('li');
                    var idx = li[li.length - 1].dataset['idx'];
                    recentInit(ref.startAfter(idx));
                }
                else {

                    recentInit(ref);
                }
            }
 */