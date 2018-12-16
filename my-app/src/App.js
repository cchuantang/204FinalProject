import React, { Component } from 'react';
import axios from 'axios';

// CSS beautifier
import cssbeautify from 'cssbeautify';

// FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { faStar, faFileCode, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

// Main styles
import './App.scss';

// Helper functions
import sortByName from './helpers/sortByName';
import authenticated from './helpers/authenticated';

// Components
import Files from './components/Files';
import TextEditor from './components/TextEditor';

// fontawesome icons
library.add(faStar);
library.add(faFileCode);
library.add(faEdit);
library.add(faTrash);

class App extends Component {
	state = {
		// Current file index
		currentFile: 0,
		// List of files
		files: [],
		// Log in state
		loggedIn: null
	};

	componentDidMount() {
		// Initial get
		this.getDataFromDB();

		// Login state
		this.setState({
			loggedIn: authenticated()
		});

		// Save event
		document.addEventListener('keydown', (e) => {
			if (e.keyCode === 83 && (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)) {
				e.preventDefault();
				// Update file
				this.updateFile();
			}
		}, false);
	}

	getDataFromDB() {
		// Get files, parse and update state
		fetch('/api/getData')
			.then(data => data.json())
			.then(res => this.setState({ files: sortByName(res.data) }))
			.catch(console.error);
	};

	saveFileToDB(file) {
		// Ajax call to save file on DB
		axios.post('/api/putData', file);
	};

	deleteFromDB(id) {
		// Ajax call to delete file from DB
		axios.delete('/api/deleteData', {
			data: { id }
		});
	};

	changeFileContent = (newContent, event) => {
		// Get file
		const files = [...this.state.files];
		const file = files[this.state.currentFile];
		
		// Change content
		file.content = newContent;
		
		// Update state
		this.setState({ files });

		// Auto-save after 3 seconds
		clearTimeout(this.fileContentChanged);
		this.fileContentChanged = setTimeout(() => {
			this.updateFile(file);
		}, 3000);
	}

	updateFile = (file) => {
		// Assumes that the change will be on current file
		if(!file) {
			file = this.state.files[this.state.currentFile];
		}

		// Ajax call to update
		axios.post('/api/updateData', {
			id: file.id,
			update: {
				content: file.content,
				starred: file.starred,
				name: file.name
			}
		});
	};

	selectFile = (currentFile) => {
		// Set current file on click
		this.setState({ currentFile });
	}

	starToggle = (index) => {
		// Toggle starred file
		const files = [...this.state.files];

		// Opposite value
		files[index].starred = !files[index].starred;

		// Update state and DB
		this.setState({ files });
		this.updateFile(files[index]);
	}

	removeFile = (index) => {
		// Get file
		const file = this.state.files[index];

		// Ask for confirmation
		if (window.confirm(`Do you want to remove the file ${file.name}?`)) {
			const { files } = this.state;
			this.setState({
				files: [...files.slice(0, index), ...files.slice(index + 1)]
			});

			// Remove from DB
			this.deleteFromDB(file);
		}
	}

	editFileName = (index) => {
		// Get file and ask for new name
		const file = this.state.files[index];
		const name = prompt('Write the new file name:', file.name);

		// If new name, udate state and DB
		if (!name) return;
		
		// Update file name
		const files = [...this.state.files];
		files[index].name = name;

		// Sort files
		sortByName(files);

		// Update state and DB
		this.setState({ files });
		this.updateFile(file);		
	}

	newFile = () => {
		// Ask for new file's name
		const name = window.prompt('Write the new file name');

		// Exits if user cancelled prompt
		if (!name) return;

		// Set file data
		const newFile = {
			id: Date.now(),
			name,
			content: '',
			starred: false
		};

		// Sort files with new one
		const files = sortByName([...this.state.files, newFile]);

		// Update state
		this.setState({
			files,
			currentFile: files.findIndex(file => file.name === name)
		});

		// Update DB
		this.saveFileToDB(newFile);
	}

	beautify = () => {
		// Beautify; only for CSS and JSON
		const files = [...this.state.files];
		const file = files[this.state.currentFile];

		// Get extension
		const extension = file ? file.name.split('.')[1] : '';

		switch(extension) {
			case 'css':
				file.content = cssbeautify(file.content);
				break;
				
			case 'json':
				file.content = JSON.stringify(JSON.parse(file.content), null, '\t');
				break;
				
			default:
				alert('Only CSS and JSON beautify supported');
				return;
		}
		
		// Update state
		this.setState({ files });
	}

	render() {
		const { loggedIn, files, currentFile } = this.state;

		return (
			<div className="app-container">
				{!loggedIn &&
					<a
						className="login-button"
						href="https://github.com/login/oauth/authorize?client_id=8a1687848313cff592cf&redirect_uri=http://localhost:3001/oauth/redirect">
						Login with Github
        			</a>
				}
				{loggedIn &&
					<div className='app'>
						<Files
							files={files}
							selectFile={this.selectFile}
							starToggle={this.starToggle}
							removeFile={this.removeFile}
							editFileName={this.editFileName}
							newFile={this.newFile}
							currentFile={currentFile} />

						<TextEditor
							onChange={this.changeFileContent}
							onSave={this.updateFile}
							file={files[currentFile] || ''} />
						
						<div className="beautifier" onClick={this.beautify}></div>
					</div>
				}
			</div>
		);
	}
}

export default App;
