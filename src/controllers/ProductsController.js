const Product = require('../models/ProductModel');
const NutricionalsInformations = require('../models/NutricionalsInformations');
const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

exports.createProduct = async (req, res) => {
    const transaction = await sequelize.transaction();

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
            additives,
            nutricionalInformations // Ajouter ceci à la demande
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

                    // Déterminer le dossier de destination en fonction du nom du fichier
                    let uploadFolder;
                    if (file.fieldname === 'picture') {
                        uploadFolder = 'picture';
                    } else if (file.fieldname === 'ingredientsPicture') {
                        uploadFolder = 'ingredientsPicture';
                    } else if (file.fieldname === 'nutricionalInformationPicture') {
                        uploadFolder = 'nutricionalInformationPicture';
                    } else {
                        uploadFolder = 'other'; // Dossier par défaut
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
                    processedPictures.push(`${process.env.URL}/uploads/${uploadFolder}/${fileName}`);
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
        }, { transaction });


        if (nutricionalInformations && Array.isArray(nutricionalInformations)) {
            for (const info of nutricionalInformations) {
                const nutricionalInformation = await NutricionalsInformations.create({
                    productId: product.id,
                    ref: info.ref,
                    name: info.name,
                    value: info.value,
                    unit: info.unit
                }, { transaction });

            }
        }

        // Récupérer un produit avec ses informations nutritionnelles associées
const productWithNutricionals = await Product.findByPk(product.id, {
    include: [{ model: NutricionalsInformations, as: 'nutricionalInformations' }]
});

        await transaction.commit();


        res.status(201).json({ message: 'Produit créé avec succès.', product, nutricionalInformations: productWithNutricionals });
    } catch (error) {
        await transaction.rollback();
        console.error("Erreur lors de la création du produit:", error);
        res.status(500).json({ error: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.searchProduct = async (req, res) => {
    try {
        const search = req.params.search;

        const searchResult = await Product.findAll({
            where: {
                [Op.and]: [
                    { 
                        [Op.or]: [
                            { title: { [Op.like]: `%${search}%` } },
                            { brand: { [Op.like]: `%${search}%` } },
                        ]
                    },
                    { statut: 'Available' } 
                ]
            }
        });



        res.status(200).json({ searchResult });
    } catch (error) {
        console.error("Erreur lors de la Recherche:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.scanProduct = async (req, res) => {
    try{
    const scan = req.params.scan
    const scanResult = await Product.findOne({ where: barCode={ scan },  statut: 'Available'  });
    if (scanResult){
        result = scanResult.id
    }else{
        res.status(401).json({ message: "pas trouver" });

    }
    res.status(200).json({ result });
} catch (error) {
    console.error("Erreur lors de la Recherche:", error);
    res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
}
};

exports.getProduct = async (req, res) => {
    try {
        const id = req.params.id;
        
        // Rechercher un produit par sa clé primaire
        const result = await Product.findByPk(id);

        // Vérifier si le produit existe et si son statut est 'Available'
        if (!result || result.statut !== 'Available') {
            return res.status(404).json({ message: "Produit non trouvé ou non disponible" });
        }

        // Récupérer un produit avec ses informations nutritionnelles associées
        const productWithNutricionals = await Product.findByPk(id, {
            include: [{ model: NutricionalsInformations, as: 'nutricionalInformations' }]
        });

        res.status(200).json({ product: result, nutricionals: productWithNutricionals });
    } catch (error) {
        console.error("Erreur lors de la recherche du produit:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
}



