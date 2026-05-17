import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Comment, CommentInput, HealthStatus, ListUsersParams, ListVideosParams, User, Video, VideoInput, VideoStats } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListVideosUrl: (params?: ListVideosParams) => string;
/**
 * @summary List videos for feed
 */
export declare const listVideos: (params?: ListVideosParams, options?: RequestInit) => Promise<Video[]>;
export declare const getListVideosQueryKey: (params?: ListVideosParams) => readonly ["/api/videos", ...ListVideosParams[]];
export declare const getListVideosQueryOptions: <TData = Awaited<ReturnType<typeof listVideos>>, TError = ErrorType<unknown>>(params?: ListVideosParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listVideos>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listVideos>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListVideosQueryResult = NonNullable<Awaited<ReturnType<typeof listVideos>>>;
export type ListVideosQueryError = ErrorType<unknown>;
/**
 * @summary List videos for feed
 */
export declare function useListVideos<TData = Awaited<ReturnType<typeof listVideos>>, TError = ErrorType<unknown>>(params?: ListVideosParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listVideos>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateVideoUrl: () => string;
/**
 * @summary Create a new video post
 */
export declare const createVideo: (videoInput: VideoInput, options?: RequestInit) => Promise<Video>;
export declare const getCreateVideoMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createVideo>>, TError, {
        data: BodyType<VideoInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createVideo>>, TError, {
    data: BodyType<VideoInput>;
}, TContext>;
export type CreateVideoMutationResult = NonNullable<Awaited<ReturnType<typeof createVideo>>>;
export type CreateVideoMutationBody = BodyType<VideoInput>;
export type CreateVideoMutationError = ErrorType<unknown>;
/**
* @summary Create a new video post
*/
export declare const useCreateVideo: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createVideo>>, TError, {
        data: BodyType<VideoInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createVideo>>, TError, {
    data: BodyType<VideoInput>;
}, TContext>;
export declare const getGetVideoUrl: (id: number) => string;
/**
 * @summary Get a single video
 */
export declare const getVideo: (id: number, options?: RequestInit) => Promise<Video>;
export declare const getGetVideoQueryKey: (id: number) => readonly [`/api/videos/${number}`];
export declare const getGetVideoQueryOptions: <TData = Awaited<ReturnType<typeof getVideo>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVideo>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getVideo>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetVideoQueryResult = NonNullable<Awaited<ReturnType<typeof getVideo>>>;
export type GetVideoQueryError = ErrorType<unknown>;
/**
 * @summary Get a single video
 */
export declare function useGetVideo<TData = Awaited<ReturnType<typeof getVideo>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVideo>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getLikeVideoUrl: (id: number) => string;
/**
 * @summary Like or unlike a video
 */
export declare const likeVideo: (id: number, options?: RequestInit) => Promise<Video>;
export declare const getLikeVideoMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof likeVideo>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof likeVideo>>, TError, {
    id: number;
}, TContext>;
export type LikeVideoMutationResult = NonNullable<Awaited<ReturnType<typeof likeVideo>>>;
export type LikeVideoMutationError = ErrorType<unknown>;
/**
* @summary Like or unlike a video
*/
export declare const useLikeVideo: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof likeVideo>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof likeVideo>>, TError, {
    id: number;
}, TContext>;
export declare const getGetTrendingVideosUrl: () => string;
/**
 * @summary Get trending/discover videos
 */
export declare const getTrendingVideos: (options?: RequestInit) => Promise<Video[]>;
export declare const getGetTrendingVideosQueryKey: () => readonly ["/api/videos/trending"];
export declare const getGetTrendingVideosQueryOptions: <TData = Awaited<ReturnType<typeof getTrendingVideos>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrendingVideos>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getTrendingVideos>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetTrendingVideosQueryResult = NonNullable<Awaited<ReturnType<typeof getTrendingVideos>>>;
export type GetTrendingVideosQueryError = ErrorType<unknown>;
/**
 * @summary Get trending/discover videos
 */
export declare function useGetTrendingVideos<TData = Awaited<ReturnType<typeof getTrendingVideos>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getTrendingVideos>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetVideoStatsUrl: () => string;
/**
 * @summary Platform-wide stats for dashboard
 */
export declare const getVideoStats: (options?: RequestInit) => Promise<VideoStats>;
export declare const getGetVideoStatsQueryKey: () => readonly ["/api/videos/stats"];
export declare const getGetVideoStatsQueryOptions: <TData = Awaited<ReturnType<typeof getVideoStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVideoStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getVideoStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetVideoStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getVideoStats>>>;
export type GetVideoStatsQueryError = ErrorType<unknown>;
/**
 * @summary Platform-wide stats for dashboard
 */
export declare function useGetVideoStats<TData = Awaited<ReturnType<typeof getVideoStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getVideoStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListCommentsUrl: (id: number) => string;
/**
 * @summary List comments on a video
 */
export declare const listComments: (id: number, options?: RequestInit) => Promise<Comment[]>;
export declare const getListCommentsQueryKey: (id: number) => readonly [`/api/videos/${number}/comments`];
export declare const getListCommentsQueryOptions: <TData = Awaited<ReturnType<typeof listComments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListCommentsQueryResult = NonNullable<Awaited<ReturnType<typeof listComments>>>;
export type ListCommentsQueryError = ErrorType<unknown>;
/**
 * @summary List comments on a video
 */
export declare function useListComments<TData = Awaited<ReturnType<typeof listComments>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listComments>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateCommentUrl: (id: number) => string;
/**
 * @summary Post a comment on a video
 */
export declare const createComment: (id: number, commentInput: CommentInput, options?: RequestInit) => Promise<Comment>;
export declare const getCreateCommentMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createComment>>, TError, {
        id: number;
        data: BodyType<CommentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createComment>>, TError, {
    id: number;
    data: BodyType<CommentInput>;
}, TContext>;
export type CreateCommentMutationResult = NonNullable<Awaited<ReturnType<typeof createComment>>>;
export type CreateCommentMutationBody = BodyType<CommentInput>;
export type CreateCommentMutationError = ErrorType<unknown>;
/**
* @summary Post a comment on a video
*/
export declare const useCreateComment: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createComment>>, TError, {
        id: number;
        data: BodyType<CommentInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createComment>>, TError, {
    id: number;
    data: BodyType<CommentInput>;
}, TContext>;
export declare const getListUsersUrl: (params?: ListUsersParams) => string;
/**
 * @summary List/search users
 */
export declare const listUsers: (params?: ListUsersParams, options?: RequestInit) => Promise<User[]>;
export declare const getListUsersQueryKey: (params?: ListUsersParams) => readonly ["/api/users", ...ListUsersParams[]];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<unknown>;
/**
 * @summary List/search users
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<unknown>>(params?: ListUsersParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetUserUrl: (id: number) => string;
/**
 * @summary Get a user profile
 */
export declare const getUser: (id: number, options?: RequestInit) => Promise<User>;
export declare const getGetUserQueryKey: (id: number) => readonly [`/api/users/${number}`];
export declare const getGetUserQueryOptions: <TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetUserQueryResult = NonNullable<Awaited<ReturnType<typeof getUser>>>;
export type GetUserQueryError = ErrorType<unknown>;
/**
 * @summary Get a user profile
 */
export declare function useGetUser<TData = Awaited<ReturnType<typeof getUser>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getFollowUserUrl: (id: number) => string;
/**
 * @summary Follow or unfollow a user
 */
export declare const followUser: (id: number, options?: RequestInit) => Promise<User>;
export declare const getFollowUserMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof followUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof followUser>>, TError, {
    id: number;
}, TContext>;
export type FollowUserMutationResult = NonNullable<Awaited<ReturnType<typeof followUser>>>;
export type FollowUserMutationError = ErrorType<unknown>;
/**
* @summary Follow or unfollow a user
*/
export declare const useFollowUser: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof followUser>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof followUser>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map