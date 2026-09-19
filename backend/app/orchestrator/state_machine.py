from enum import StrEnum


class PipelineStatus(StrEnum):
    IDEA_CREATED = "IDEA_CREATED"
    SCRIPT_GENERATING = "SCRIPT_GENERATING"
    SCRIPT_REVIEW = "SCRIPT_REVIEW"
    SCRIPT_REJECTED = "SCRIPT_REJECTED"
    SCRIPT_APPROVED = "SCRIPT_APPROVED"
    ASSETS_COLLECTING = "ASSETS_COLLECTING"
    VOICE_GENERATING = "VOICE_GENERATING"
    VIDEO_BUILDING = "VIDEO_BUILDING"
    MOTION_PROCESSING = "MOTION_PROCESSING"
    VIDEO_RENDERED = "VIDEO_RENDERED"
    QUALITY_REVIEW = "QUALITY_REVIEW"
    QUALITY_FAILED = "QUALITY_FAILED"
    FINAL_REVIEW = "FINAL_REVIEW"
    FINAL_REJECTED = "FINAL_REJECTED"
    READY_TO_SCHEDULE = "READY_TO_SCHEDULE"
    SCHEDULED = "SCHEDULED"
    PUBLISHING = "PUBLISHING"
    PUBLISHED = "PUBLISHED"
    PUBLISH_FAILED = "PUBLISH_FAILED"
    ANALYTICS_COLLECTING = "ANALYTICS_COLLECTING"
    COMPLETED = "COMPLETED"
    NEEDS_INTERVENTION = "NEEDS_INTERVENTION"
    PIPELINE_PAUSED = "PIPELINE_PAUSED"


ALLOWED_TRANSITIONS: dict[PipelineStatus, set[PipelineStatus]] = {
    PipelineStatus.IDEA_CREATED: {PipelineStatus.SCRIPT_GENERATING},
    PipelineStatus.SCRIPT_GENERATING: {PipelineStatus.SCRIPT_REVIEW, PipelineStatus.NEEDS_INTERVENTION},
    PipelineStatus.SCRIPT_REVIEW: {
        PipelineStatus.SCRIPT_APPROVED,
        PipelineStatus.SCRIPT_REJECTED,
        PipelineStatus.NEEDS_INTERVENTION,
    },
    PipelineStatus.SCRIPT_REJECTED: {PipelineStatus.SCRIPT_GENERATING, PipelineStatus.NEEDS_INTERVENTION},
    PipelineStatus.SCRIPT_APPROVED: {PipelineStatus.ASSETS_COLLECTING},
    PipelineStatus.ASSETS_COLLECTING: {PipelineStatus.VOICE_GENERATING, PipelineStatus.NEEDS_INTERVENTION},
    PipelineStatus.VOICE_GENERATING: {PipelineStatus.VIDEO_BUILDING, PipelineStatus.NEEDS_INTERVENTION},
    PipelineStatus.VIDEO_BUILDING: {PipelineStatus.MOTION_PROCESSING, PipelineStatus.NEEDS_INTERVENTION},
    PipelineStatus.MOTION_PROCESSING: {PipelineStatus.VIDEO_RENDERED, PipelineStatus.NEEDS_INTERVENTION},
    PipelineStatus.VIDEO_RENDERED: {PipelineStatus.QUALITY_REVIEW},
    PipelineStatus.QUALITY_REVIEW: {PipelineStatus.FINAL_REVIEW, PipelineStatus.QUALITY_FAILED},
    PipelineStatus.QUALITY_FAILED: {
        PipelineStatus.SCRIPT_GENERATING,
        PipelineStatus.ASSETS_COLLECTING,
        PipelineStatus.VOICE_GENERATING,
        PipelineStatus.MOTION_PROCESSING,
        PipelineStatus.NEEDS_INTERVENTION,
    },
    PipelineStatus.FINAL_REVIEW: {PipelineStatus.READY_TO_SCHEDULE, PipelineStatus.FINAL_REJECTED},
    PipelineStatus.FINAL_REJECTED: {
        PipelineStatus.SCRIPT_GENERATING,
        PipelineStatus.ASSETS_COLLECTING,
        PipelineStatus.VOICE_GENERATING,
        PipelineStatus.MOTION_PROCESSING,
        PipelineStatus.NEEDS_INTERVENTION,
    },
    PipelineStatus.READY_TO_SCHEDULE: {PipelineStatus.SCHEDULED},
    PipelineStatus.SCHEDULED: {PipelineStatus.PUBLISHING},
    PipelineStatus.PUBLISHING: {PipelineStatus.PUBLISHED, PipelineStatus.PUBLISH_FAILED},
    PipelineStatus.PUBLISH_FAILED: {PipelineStatus.PUBLISHING, PipelineStatus.NEEDS_INTERVENTION},
    PipelineStatus.PUBLISHED: {PipelineStatus.ANALYTICS_COLLECTING},
    PipelineStatus.ANALYTICS_COLLECTING: {PipelineStatus.COMPLETED},
    PipelineStatus.COMPLETED: set(),
    PipelineStatus.NEEDS_INTERVENTION: set(),
    PipelineStatus.PIPELINE_PAUSED: set(),
}


class InvalidTransitionError(ValueError):
    pass


def can_transition(current: PipelineStatus, target: PipelineStatus) -> bool:
    return target in ALLOWED_TRANSITIONS[current]


def assert_transition(current: PipelineStatus, target: PipelineStatus) -> None:
    if not can_transition(current, target):
        raise InvalidTransitionError(f"Invalid pipeline transition: {current} -> {target}")
