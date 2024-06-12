const fs = require('fs');
const path = require('path');
const Product = require('../models/ProductModel');
require('dotenv').config();

exports.createProduct = async (req, res) => {
    try {
        const {
            title,
            statut,
            quantity,
            quantityUnit,
            barCode,
            rate,
            link,
            conditioning,
            brand,
            ingredientsList,
            alergens,
            ingredientsOrigin,
            manufacturingProcessingLocation,
            labelsCertifAwards,
            possibleTraces,
            addedAminoAcid,
            addedVitamins,
            addedMinerals,
            additives
        } = req.body;

        // Vérification des données d'entrée
        if (!title) {
            return res.status(400).json({ message: "Le champ 'title' est obligatoire." });
        }

        // Traitement des images
        const processedPictures = [];
        if (req.files && Array.isArray(req.files)) {
            req.files.forEach(file => {
                if (file && file.buffer) {
                    const randomNumbers = Math.random().toString(36).substring(2, 8);
                    const fileExtension = file.originalname.replace(/\s+/g, '_');
                    const fileName = `${randomNumbers}-${fileExtension}`;
                    // Déterminer le dossier de destination en fonction de la clé dans le corps de la requête
                    let uploadFolder;

                    console.log(file.fieldname)
                    if (file.fieldname === 'picture') {
                        uploadFolder = '/picture';
                    } else if (file.fieldname === 'ingredientsPicture') {
                        uploadFolder = '/ingredientsPicture';
                    } else if (file.fieldname === 'nutricionalInformationPicture') {
                        uploadFolder = '/nutricionalInformationPicture';
                    } else {
                        uploadFolder = '/others'; // Dossier par défaut
                    }

                    // Créer le dossier s'il n'existe pas déjà
                    const uploadFolderPath = path.join(__dirname, '..', 'uploads', uploadFolder);
                    if (!fs.existsSync(uploadFolderPath)) {
                        fs.mkdirSync(uploadFolderPath, { recursive: true });
                    }

                    // Enregistrer le fichier dans le dossier correspondant
                    const uploadPath = path.join(uploadFolderPath, fileName);
                    fs.writeFileSync(uploadPath, file.buffer);
                    
                    // Ajouter le chemin d'accès au fichier dans le tableau des images traitées
                    processedPictures.push(`${process.env.URL}/uploads${uploadFolder}/${fileName}`);
                }
            });
        }

        // Création du produit
        const product = await Product.create({
            title,
            statut,
            quantity,
            quantityUnit,
            barCode,
            rate,
            link,
            conditioning,
            brand,
            ingredientsList,
            alergens,
            ingredientsOrigin,
            manufacturingProcessingLocation,
            labelsCertifAwards,
            possibleTraces,
            addedAminoAcid,
            addedVitamins,
            addedMinerals,
            additives,
            picture: processedPictures.find(image => image.includes('picture')),
            ingredientsPicture: processedPictures.find(image => image.includes('ingredientsPicture')),
            nutricionalInformationPicture: processedPictures.find(image => image.includes('nutricionalInformationPicture'))
        });

        res.status(201).json({ message: 'Produit créé avec succès.', product });
    } catch (error) {
        console.error("Erreur lors de la création du produit:", error);
        res.status(500).json({ error: "Une erreur est survenue lors du traitement de votre demande." });
    }
};
