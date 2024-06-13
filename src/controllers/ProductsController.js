const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const History = require('../models/HistoryModel');
const Category = require('../models/CategoryModel')
const Product = require('../models/ProductModel');
const NutricionalsInformations = require('../models/NutricionalsInformations');
const User = require('../models/UserModel');


exports.searchProduct = async (req, res) => {
    try {
        
        const search = req.params.search;
        // Vérifiez si la chaîne de recherche contient au moins 2 caractères
        if (search.length < 2) {
            return res.status(400).json({ message: "La recherche doit contenir au moins 2 caractères." });
        }
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
            },
            include: [
                { model: NutricionalsInformations, as: 'nutricionalInformations' },
                { model: Category, as: 'categories' }
            ]
        });
        if (searchResult.length === 0) {
            return res.status(404).json({ message: "Aucun produit trouvé pour cette recherche." });
        }

        res.status(200).json({ searchResult });
    } catch (error) {
        console.error("Erreur lors de la Recherche:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.scanProduct = async (req, res) => {
    try {
        const scan = req.params.scan;

        if (!scan) {
            return res.status(400).json({ message: "Le code barre est requis pour la recherche." });
        }

        const scanResult = await Product.findOne({ where: { barCode: scan, statut: 'Available' } });

        if (!scanResult) {
            return res.status(404).json({ message: "Aucun produit trouvé pour ce code barre." });
        }

        const result = { id: scanResult.id }; 

        res.status(200).json({ result });
    } catch (error) {
        console.error("Erreur lors de la recherche du produit par scan:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{
                model: Product,
                where: { statut: 'Available' }
            }]
        });

        // Vérifier si des catégories ont été trouvées
        if (categories.length === 0) {
            return res.status(404).json({ message: "Aucune catégorie trouvée pour les produits disponibles." });
        }

        // Récupérer uniquement les titres distincts
        const distinctCategories = [...new Set(categories.map(cat => cat.title))];

        res.status(200).json({ categories: distinctCategories });
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.getProductsByCategory = async (req, res) => {
    try {
        const categoryTitle = req.params.title;

        // Récupérer tous les produits associés à une catégorie spécifique avec statut 'Available'
        const products = await Product.findAll({
            where: { statut: 'Available' },
            include: [{
                model: Category,
                as: 'categories',
                where: { title: categoryTitle }
            }]
        });

        // Vérifier si des produits ont été trouvés
        if (products.length === 0) {
            return res.status(404).json({ message: "Aucun produit trouvé pour cette catégorie." });
        }

        res.status(200).json({ products });
    } catch (error) {
        console.error("Erreur lors de la récupération des produits par catégorie:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.getProduct = async (req, res) => {
    let transaction;
    try {
        transaction = await sequelize.transaction();

        const id = req.params.id;
        const userId = req.user.id; // Assurez-vous de récupérer l'ID de l'utilisateur de manière appropriée

        // Rechercher un produit par sa clé primaire avec ses catégories associées
        const product = await Product.findByPk(id, {
            include: [
                { model: NutricionalsInformations, as: 'nutricionalInformations' },
                { model: Category, as: 'categories' }
            ]
        });

        // Vérifier si le produit existe et si son statut est 'Available'
        if (!product || product.statut !== 'Available') {
            await transaction.rollback();
            return res.status(404).json({ message: "Produit non trouvé ou non disponible" });
        }

        // Vérifier si l'utilisateur a déjà consulté ce produit
        let historyEntry = await History.findOne({
            where: {
                userId: userId,
                productId: id
            }
        });

        if (!historyEntry) {
            // Si aucune entrée d'historique n'existe, créer une nouvelle entrée
            await History.create({
                userId: userId,
                productId: id
            }, { transaction });
        } else {
            // Si une entrée d'historique existe, mettre à jour cette entrée
            await History.update({
                productId: id // Exemple de mise à jour d'un champ (mettre à jour une date)
            }, {
                where: {
                    userId: userId,
                    productId: id
                },
                transaction
            });
        }

        await transaction.commit();

        res.status(200).json({ product });
    } catch (error) {
        console.error("Erreur lors de la recherche du produit:", error);
        if (transaction) {
            await transaction.rollback();
        }
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

exports.getUserHistory = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findByPk(userId, {
            include: [
                {
                    model: History,
                    as: 'userHistories',
                    include: [
                        {
                            model: Product,
                            as: 'product'
                        }
                    ]
                }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        res.status(200).json(user.userHistories);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique de l'utilisateur:", error);
        res.status(500).json({ message: "Une erreur est survenue lors du traitement de votre demande." });
    }
};

// Just for admin via Postman
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
            nutricionalInformations,
            categories
        } = req.body;
        console.log(req.body)
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

        // Traitement des informations nutritionnelles
        if (nutricionalInformations) {
            for (const info of nutricionalInformations) {
                await NutricionalsInformations.create({
                    productId: product.id,
                    ref: info.ref,
                    name: info.name,
                    value: info.value,
                    unit: info.unit || '' // Fournir une valeur par défaut pour unit si elle est absente
                }, { transaction });
            }
        }

        // Associer les catégories au produit
        if (categories) {
            for (const category of categories) {
                await Category.create({
                    productId: product.id,
                    title: category.title,
                }, { transaction });
            }
        }

        // Récupérer le produit avec ses informations nutritionnelles et ses catégories associées
        const productWithDetails = await Product.findByPk(product.id, {
            include: [
                { model: NutricionalsInformations, as: 'nutricionalInformations' },
                { model: Category, as: 'categories' }
            ]
        });

        await transaction.commit();

        res.status(201).json({ message: 'Produit créé avec succès.', product, product_details: productWithDetails });
    } catch (error) {
        await transaction.rollback();
        console.error("Erreur lors de la création du produit:", error);
        res.status(500).json({ error: "Une erreur est survenue lors du traitement de votre demande." });
    }
};