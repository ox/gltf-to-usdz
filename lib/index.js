// Native
const fs = require('fs');

// Vendor
const gltfValidator = require('gltf-validator');

// Converter
const converter = require('./converter');

// Arguments
const { input, output } = require('./argsHandler');

// Constants
const { SUPPORTED_INPUT_TYPES, SUPPORTED_OUTPUT_TYPES } = require('./constants');

// File loader
const fileLoader = require('./fileLoader');

// Utilities
const { getFileExtension } = require('./utilities');

const pipe = () => {
	const inputFileExtension = getFileExtension(input);
	const outputFileExtension = getFileExtension(output);

	if (!SUPPORTED_OUTPUT_TYPES.includes(outputFileExtension)) {
		console.error(`${outputFileExtension} is not supported.`);
		console.error(`The supported filetypes are: [${SUPPORTED_OUTPUT_TYPES}]`);
		return;
	}

	if (SUPPORTED_INPUT_TYPES.includes(inputFileExtension)) {
		fileLoader(input, 'utf8')
			.then((gltf) => {
				const parsedGltf = JSON.parse(gltf);

				gltfValidator
					.validateBytes(new Uint8Array(Buffer.from(JSON.stringify(parsedGltf))))
					.catch((error) => {
						console.warn('Validation failed: ', error);
					});

				const convertedFile = converter(parsedGltf);

				convertedFile.then((data) => {
					fs.writeFile(output, data, (error) => {
						if (!error) {
							console.log(`Written file to ${output}`);
						} else {
							console.error(error);
						}
					});
				});
			})
			.catch((error) => {
				console.error(error);
			});
	} else {
		console.error(`${inputFileExtension} is not supported.`);
		console.error(`The supported file extensions are: [${SUPPORTED_INPUT_TYPES}]`);
	}
};

pipe();
