const TagsEditor = (function(){
	function Controller(){
		let myModel = null;
		let uiElems = null;

		this.init = function(model, ui){
			myModel = model;
			uiElems = ui;

			uiElems.addBtn.addEventListener('click', this.addNewTag);
			uiElems.readonlyBtn.addEventListener('click', myModel.readonlyToggle);
			uiElems.tagList.addEventListener('click', this.deleteTag);
			uiElems.tagList.addEventListener('click', this.openColorList);
		};

		this.addNewTag = function(e){ // 추가 기능 핸들러
			e.preventDefault();
			myModel.addNewTag(uiElems.tagInput.value);
		};

		this.deleteTag = function(e){ // 삭제 기능 핸들러
			const target = e.target;
			if (target.tagName !== 'SPAN' || target.className !== 'del-btn') return;
			myModel.deleteTag(target.closest('li').textContent);
		};

		this.openColorList = function(e){ // 색상 선정 핸들러
			const target = e.target;
			if (target.tagName !== 'SPAN' || target.className !== 'color-picker') return;
			e.preventDefault();
			myModel.openColorList(e, uiElems);
		};
	};

	function Model(){
		let myView = null;
		let readonly = null;
		let tags = null; // init 실행 후 배열 형태

		this.init = function(view){ // 초기화 > 연쇄로 update, settag, gettag 작동
			myView = view;

			this.getTagsListFromLocalStorage(); // 로컬저장소 읽음
			this.updateTagsList(); // 출력부와 로컬저장소 모두 업데이트
		};

		this.updateTagsList = function(){ // 태그를 받아 출력하고 다시 로컬저장소에 문자화 저장 하는 기능
			myView.updateTagsList(tags); // 변경된 태그들을 받아 출력 시킴
			this.setTagsListInLocalStorage(); // 변경된 내용을 로컬저장소에 저장
		};

		this.addNewTag = function(str){
			const newTags = str.split(' '); // 공백 기준으로 자름
			newTags.forEach(element => { // 중복되지 않고 공백이 없다면 태그(들) 추가
				if(!tags.includes(element) && element.trim()){
					let template = { // edit by kimson for tag color
						color: '#f7f6f9',
						text: element
					};
					tags.push(template);
				};
			});
			this.updateTagsList();
			myView.clearInput();
		};

		this.deleteTag = function(tag){ // tags는 배열형태이기 때문에 filter로 돌림
			tags = tags.filter(e => e.text !== tag); // edit by kimson for tag color
			this.updateTagsList(); // filtering된 태그들을 다시 저장
		};

		this.setTagsListInLocalStorage = function(){ // 태그들을 문자화하여 로컬저장소에 다시 저장
			localStorage.tagsList = JSON.stringify(tags);
		};

		this.getTagsListFromLocalStorage = function(){ // 로컬저장소 읽고, 있으면 파싱하고 없으면 []으로 둠
			tags = localStorage.tagsList ? JSON.parse(localStorage.tagsList) : [];
		};

		this.openColorList = function(event, ui){ // added by kimson for tag color
			const target = event.target.parentNode;
			const uiElems = ui;
			const clonePannel = uiElems.colorPannel.cloneNode(true);
			const id = tags[tags.indexOf(target.textContent.trim())];
			let pannel = target.querySelector(`#${id}`);
			if(pannel == null){
				clonePannel.id = id;
				target.prepend(clonePannel);
			}
			pannel = target.querySelector(`#${id}`);
			if(pannel.classList.contains('hide') || !pannel.classList.contains('show')){
				pannel.classList.add("show");
				pannel.classList.remove("hide");
			} else {
				pannel.classList.add("hide");
				pannel.classList.remove("show");
				setTimeout(()=>{
					pannel.remove();
				}, 300);
			}
			pannel.addEventListener('click', (this.setColorToTag).bind(this));
		}

		this.setColorToTag = function(ev){ // added by kimson for tag color
			const target = ev.target;
			const style = getComputedStyle(ev.target);
			ev.preventDefault();
			if(target.tagName !== 'SPAN' && target.className !== 'color') return;
			let text = target.closest('.tag-list-item').textContent.trim();
			tags = tags.map(x=>{
				if(x.text == text){
					x.color = style['background-color'];
				}
				return x;
			});
			target.closest('.tag-list-item').style.cssText = `
				background-color: ${style['background-color']};
			`;
			target.closest('.color-pannel').remove();
			this.updateTagsList();
		}

		this.readonlyToggle = function(){
			readonly = !readonly;
			myView.readonlyToggle(readonly);
		};
	};

	function View(){
		let uiElems = null;

		this.init = function(ui){
			uiElems = ui;
			uiElems.readonlyBtn.checked = false;
		};

		this.updateTagsList = function(tags){ // 저장된 스토리지 읽어 업데이트함
			const tagListItem = tag => `<li class="tag-list-item" style="background-color: ${tag.color}"><span class="color-picker"></span>${tag.text}<span class="del-btn"></span></li>`;
			let tagsStr = ''; 

			tags.forEach(tag => {
				tagsStr += tagListItem(tag);
			});

			uiElems.tagList.innerHTML = tagsStr;
		};

		this.clearInput = function(){ // 입력 후 입력창 초기화
			uiElems.tagInput.value = '';
		};

		this.readonlyToggle = function(isReadonly){ // readonly 기능
			uiElems.tagInput.disabled = isReadonly;
			uiElems.addBtn.disabled = isReadonly;
			uiElems.tagList.classList.toggle('readonly');
		};
	};

	return {
		init: function(){ 
			const moduleContainer = document.querySelector('.tag-create-container'); // 태그 생성 보드
			const tagInput = moduleContainer.querySelector('.tag-inp'); // 인풋 창
			const addBtn = moduleContainer.querySelector('.add-btn'); // 추가 버튼
			const tagList = moduleContainer.querySelector('.tag-list'); // 태그 리스트
			const readonlyBtn =  moduleContainer.querySelector('.readonly-btn'); // 읽기 전용 버튼
			const colorPannel =  moduleContainer.querySelector('.color-pannel'); // added by kimson for tag color

			const ui = { // ui구성 노드들
				moduleContainer,
				tagInput,
				addBtn,
				tagList,
				readonlyBtn,
				colorPannel, // added by kimson for tag color
			};

			const moduleView = new View();
			const moduleModel = new Model();
			const moduleController = new Controller();

			moduleView.init(ui);
			moduleModel.init(moduleView);
			moduleController.init(moduleModel, ui);
		},
	};
}());