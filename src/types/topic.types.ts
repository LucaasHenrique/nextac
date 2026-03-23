export interface CreateTopicBody {
    name: string;
}

export interface AddTopicsBody {
    topicIds: string[];
}

export interface TopicIdParam {
    topicId: string;
}
