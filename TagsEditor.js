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
		};

		this.addNewTag = function(e){
			e.preventDefault();
			myModel.addNewTag(uiElems.tagInput.value)
		};

		this.deleteTag = function(e){
			const target = e.target;
			if (target.tagName !== 'SPAN') return;
			myModel.deleteTag(target.closest('li').textContent);
		};
	};

	function Model(){
		let myView = null;
		let readonly = null;
		let tags = null;

		this.init = function(view){
			myView = view;

			this.getTagsListFromLocalStorage();
			this.updateTagsList();
		};

		this.updateTagsList = function(){
			myView.updateTagsList(tags);
			this.setTagsListInLocalStorage();
		};

		this.addNewTag = function(str){
			const newTags = str.split(' ');
			newTags.forEach(element => {
				if(!tags.includes(element) && element.trim()){
					tags.push(element);
				};
			});
			this.updateTagsList();
			myView.clearInput();
		};

		this.deleteTag = function(tag){
			tags = tags.filter(e => e !== tag);
			this.updateTagsList();
		};

		this.setTagsListInLocalStorage = function(){
			localStorage.tagsList = JSON.stringify(tags);
		};

		this.getTagsListFromLocalStorage = function(){
			tags = localStorage.tagsList ? JSON.parse(localStorage.tagsList) : [];
		};

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

		this.updateTagsList = function(tags){
			const tagListItem = tag => `<li class="tag-list-item">${tag}<span class="del-btn"></span></li>`;
			let tagsStr = ''; 

			tags.forEach(tag => {
				tagsStr += tagListItem(tag);
			});

			uiElems.tagList.innerHTML = tagsStr;
		};

		this.clearInput = function(){
			uiElems.tagInput.value = '';
		};

		this.readonlyToggle = function(isReadonly){
			uiElems.tagInput.disabled = isReadonly;
			uiElems.addBtn.disabled = isReadonly;
			uiElems.tagList.classList.toggle('readonly');
		};
	};

	return {
		init: function(){ 
			const moduleContainer = document.querySelector('.tag-create-container');
			const tagInput = moduleContainer.querySelector('.tag-inp');
			const addBtn = moduleContainer.querySelector('.add-btn');
			const tagList = moduleContainer.querySelector('.tag-list');
			const readonlyBtn =  moduleContainer.querySelector('.readonly-btn');

			const ui = {
				moduleContainer,
				tagInput,
				addBtn,
				tagList,
				readonlyBtn,
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