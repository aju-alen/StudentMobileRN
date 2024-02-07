import dotenv from "dotenv";
import Community from '../models/community.js'

dotenv.config();

export const createCommunity = async (req, res, next) => {
    const {communityProfileImage,communityName} = req.body;
    console.log(communityProfileImage,communityName, 'details coming from the client to create new community.');
    console.log(req.isAdmin, 'is the user an admin?');
    try{
        if(!req.isAdmin){
            return res.status(403).send("You are not authorized to create a community");
        }
        console.log('it is admin logged in');
        const newCommunity = new Community({
            communityProfileImage,
            communityName,
            users:[req.userId]
        });
        const savedCommunity = await newCommunity.save();
        console.log('savedCommunity',savedCommunity);
        return res.status(200).json(savedCommunity);
    }
    catch(err){
        console.log(err);
        next(err);
    }  
}

export const getAllCommunity = async (req, res, next) => {
    try{
        console.log('inside get all community');
        const communities = await Community.find();
        console.log('communities',communities);
        return res.status(200).json(communities);
    }
    catch(err){
        console.log(err);
        next(err);
    }
}

export const updateSingleCommunity = async (req, res, next) => {
    const {communityId} = req.params;
    console.log(communityId, 'communityId coming from the client to update the community.');
    try{
    const findCommunity = await Community.findById(communityId);
    if(!findCommunity){
        return res.status(404).send('Community not found');
    }
    if(findCommunity.users.includes(req.userId)){
        return res.status(200).send('You are already part of this community');
    }
    findCommunity.users.push(req.userId);
    const updatedCommunity = await findCommunity.save();
    return res.status(200).send('Community updated successfully');

}
    catch(err){
        console.log(err);
        next(err);
    }
}

export const getOneCommunity = async (req, res, next) => {
    const {communityId} = req.params;
    console.log(communityId, 'communityId coming from the client to get the community.');
    try{
        const findCommunity = await Community.findById(communityId);
        if(!findCommunity){
            return res.status(404).send('Community not found');
        }
        return res.status(200).json(findCommunity);
    }
        catch(err){
            console.log(err);
            next(err);
        }
}